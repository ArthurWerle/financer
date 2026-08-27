import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { server } from '@/tests/mocks/server'
import { usePathname, useRouter } from 'next/navigation'
import { streamChat, ChatStreamEvent } from '@/queries/chat/streamChat'
import ChatPage from './chat-page'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(),
}))
// The send path streams over fetch/SSE; mock only the network call so tests can
// script the events the page reduces into the thread (the real reducer runs).
jest.mock('@/queries/chat/streamChat', () => ({
  ...jest.requireActual('@/queries/chat/streamChat'),
  streamChat: jest.fn(),
}))
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }))

const mockedUsePathname = usePathname as jest.Mock
const mockedUseRouter = useRouter as jest.Mock
const mockedStream = streamChat as jest.Mock

// Replays scripted SSE events into the page's onEvent handler, then resolves.
const scriptStream = (events: ChatStreamEvent[]) =>
  mockedStream.mockImplementation(
    async (_messages, onEvent: (event: ChatStreamEvent) => void) => {
      for (const event of events) onEvent(event)
    }
  )

const BFF = 'http://localhost:8082/api/bff'

const chats = [
  {
    id: 'chat-1',
    userId: '1',
    title: 'Groceries budget',
    createdAt: '2026-07-10T10:00:00Z',
    updatedAt: '2026-07-12T10:00:00Z',
  },
  {
    id: 'chat-2',
    userId: '1',
    title: null,
    createdAt: '2026-07-11T10:00:00Z',
    updatedAt: '2026-07-11T10:00:00Z',
  },
]

const chatDetail = {
  chat: chats[0],
  messages: [
    {
      id: 'm1',
      chatId: 'chat-1',
      role: 'user',
      content: 'How much on groceries?',
      metadata: null,
      createdAt: '2026-07-12T09:00:00Z',
      attachments: [],
    },
    {
      id: 'm2',
      chatId: 'chat-1',
      role: 'assistant',
      content: 'You spent R$ 300 on groceries.',
      metadata: null,
      createdAt: '2026-07-12T09:00:05Z',
      attachments: [],
    },
  ],
}

const renderPage = () =>
  render(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <ChatPage />
    </QueryClientProvider>
  )

describe('ChatPage', () => {
  const push = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockedUseRouter.mockReturnValue({ push })
    mockedUsePathname.mockReturnValue('/chat')
    server.use(
      rest.get(`${BFF}/ai/chats`, (_req, res, ctx) =>
        res(ctx.json({ success: true, data: chats }))
      ),
      rest.get(`${BFF}/ai/chats/chat-1`, (_req, res, ctx) =>
        res(ctx.json({ success: true, data: chatDetail }))
      )
    )
  })

  it('lists all chats in the sidebar with title fallback and relative time', async () => {
    renderPage()

    expect(await screen.findByText('Groceries budget')).toBeInTheDocument()
    expect(screen.getAllByText('New chat').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/ago$/).length).toBeGreaterThan(0)
  })

  it('shows the empty state on a fresh chat', async () => {
    renderPage()

    expect(await screen.findByText('Start a conversation')).toBeInTheDocument()
  })

  it('renders the resumed conversation for the active chat', async () => {
    mockedUsePathname.mockReturnValue('/chat/chat-1')
    renderPage()

    expect(
      await screen.findByText('How much on groceries?')
    ).toBeInTheDocument()
    expect(
      screen.getByText('You spent R$ 300 on groceries.')
    ).toBeInTheDocument()
  })

  it('streams a message and renders the persisted answer', async () => {
    mockedUsePathname.mockReturnValue('/chat/chat-1')
    scriptStream([
      { type: 'token', value: 'R$ 120 ' },
      { type: 'token', value: 'so far.' },
      { type: 'done', success: true, chatId: 'chat-1', answer: 'R$ 120 so far.' },
    ])

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('How much on groceries?')

    await user.type(
      screen.getByPlaceholderText('Ask a question or attach a receipt…'),
      'and this month?'
    )
    await user.click(screen.getByLabelText('Send message'))

    expect(mockedStream).toHaveBeenCalledWith(
      [{ type: 'text', content: 'and this month?' }],
      expect.any(Function),
      'chat-1',
      '1'
    )
    expect(await screen.findByText('and this month?')).toBeInTheDocument()
    expect(await screen.findByText('R$ 120 so far.')).toBeInTheDocument()
  })

  it('shows tool activity while the reply streams', async () => {
    mockedUsePathname.mockReturnValue('/chat/chat-1')
    scriptStream([
      { type: 'tool_start', name: 'sum_transactions' },
      { type: 'tool_end', name: 'sum_transactions' },
      { type: 'token', value: 'R$ 120 so far.' },
      {
        type: 'done',
        success: true,
        chatId: 'chat-1',
        answer: 'R$ 120 so far.',
        toolsUsed: ['sum_transactions'],
      },
    ])

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('How much on groceries?')

    await user.type(
      screen.getByPlaceholderText('Ask a question or attach a receipt…'),
      'and this month?'
    )
    await user.click(screen.getByLabelText('Send message'))

    // The tool the agent called is surfaced in the bubble, then the answer.
    expect(await screen.findByText('Sum transactions')).toBeInTheDocument()
    expect(await screen.findByText('R$ 120 so far.')).toBeInTheDocument()
  })

  it('shows the error bubble when the ask fails', async () => {
    mockedUsePathname.mockReturnValue('/chat/chat-1')
    scriptStream([{ type: 'done', success: false, error: 'Chat not found' }])

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('How much on groceries?')

    await user.type(
      screen.getByPlaceholderText('Ask a question or attach a receipt…'),
      'hello?'
    )
    await user.click(screen.getByLabelText('Send message'))

    expect(await screen.findByText('Chat not found')).toBeInTheDocument()
  })

  it('shows the clear usage-limit message (not the raw code) when credits run out', async () => {
    mockedUsePathname.mockReturnValue('/chat/chat-1')
    scriptStream([
      {
        type: 'done',
        success: false,
        chatId: 'chat-1',
        error: 'insufficient_credits',
        errorCode: 'insufficient_credits',
        answer:
          "The AI assistant has reached its usage limit and can't answer right now. Please try again later.",
      },
    ])

    const user = userEvent.setup()
    renderPage()

    await screen.findByText('How much on groceries?')

    await user.type(
      screen.getByPlaceholderText('Ask a question or attach a receipt…'),
      'and this month?'
    )
    await user.click(screen.getByLabelText('Send message'))

    expect(await screen.findByText(/usage limit/)).toBeInTheDocument()
    expect(screen.queryByText('insufficient_credits')).not.toBeInTheDocument()
  })

  it('renames a chat from the sidebar menu', async () => {
    let patchBody: Record<string, unknown> | undefined
    server.use(
      rest.patch(`${BFF}/ai/chats/chat-1`, async (req, res, ctx) => {
        patchBody = await req.json()
        return res(
          ctx.json({ success: true, data: { ...chats[0], title: 'Renamed' } })
        )
      })
    )

    renderPage()

    await screen.findByText('Groceries budget')

    // Radix menus don't respond to simulated pointer events in jsdom, so the
    // menu is driven with keyboard events instead.
    const trigger = screen.getAllByLabelText('Chat options')[0]
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.click(await screen.findByText('Rename'))

    const input = await screen.findByPlaceholderText('Chat title')
    fireEvent.change(input, { target: { value: 'Renamed' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))

    await waitFor(() => expect(patchBody).toEqual({ title: 'Renamed' }))
  })

  it('deletes the active chat and navigates back to a new chat', async () => {
    mockedUsePathname.mockReturnValue('/chat/chat-1')
    let deleted = false
    server.use(
      rest.delete(`${BFF}/ai/chats/chat-1`, (_req, res, ctx) => {
        deleted = true
        return res(ctx.json({ success: true, data: { deleted: true } }))
      })
    )

    renderPage()

    // The active chat title shows in both the sidebar and the top bar.
    await screen.findAllByText('Groceries budget')

    const trigger = screen.getAllByLabelText('Chat options')[0]
    trigger.focus()
    fireEvent.keyDown(trigger, { key: 'Enter' })
    fireEvent.click(await screen.findByText('Delete'))
    fireEvent.click(await screen.findByRole('button', { name: 'Delete' }))

    await waitFor(() => expect(deleted).toBe(true))
    await waitFor(() => expect(push).toHaveBeenCalledWith('/chat'))
  })
})
