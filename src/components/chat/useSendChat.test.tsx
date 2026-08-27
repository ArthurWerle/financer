import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useSendChat } from './useSendChat'
import { useChatStore } from '@/stores/useChatStore'
import { fileToBase64 } from '@/queries/chat/sendChat'
import { streamChat, ChatStreamEvent } from '@/queries/chat/streamChat'
import { compressImage } from '@/utils/compressImage'

jest.mock('@/queries/chat/sendChat')
// Keep the real reducer/parser; only the network call is mocked so tests can
// script the SSE events the widget reduces into the assistant bubble.
jest.mock('@/queries/chat/streamChat', () => ({
  ...jest.requireActual('@/queries/chat/streamChat'),
  streamChat: jest.fn(),
}))
jest.mock('@/utils/compressImage')
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }))
// Stable logged-in user so the widget stamps a deterministic owner id.
jest.mock('@/queries/auth/useMe', () => ({
  useMe: () => ({ data: { id: 1 } }),
}))

const mockedStream = streamChat as jest.Mock
const mockedToBase64 = fileToBase64 as jest.Mock
const mockedCompress = compressImage as jest.Mock

// Drives the mocked stream: replays a scripted list of SSE events into the
// widget's onEvent handler, then resolves like the real streamChat.
const scriptStream = (events: ChatStreamEvent[]) =>
  mockedStream.mockImplementation(
    async (_messages, onEvent: (event: ChatStreamEvent) => void) => {
      for (const event of events) onEvent(event)
    }
  )

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>
    {children}
  </QueryClientProvider>
)

describe('useSendChat', () => {
  beforeEach(() => {
    useChatStore.setState({ isOpen: true, messages: [], chatId: null })
    jest.clearAllMocks()
  })

  it('streams a text-only message through streamChat', async () => {
    scriptStream([
      { type: 'token', value: 'You spent ' },
      { type: 'token', value: 'R$ 100' },
      { type: 'done', success: true, chatId: 'chat-1', answer: 'You spent R$ 100' },
    ])

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('How much did I spend?', null)
    })

    expect(mockedStream).toHaveBeenCalledWith(
      [{ type: 'text', content: 'How much did I spend?' }],
      expect.any(Function),
      undefined,
      '1'
    )

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    expect(messages[0]).toMatchObject({ role: 'user', text: 'How much did I spend?' })
    expect(messages[1]).toMatchObject({
      role: 'assistant',
      pending: false,
      streaming: false,
      text: 'You spent R$ 100',
    })
  })

  it('surfaces tool activity as it streams', async () => {
    scriptStream([
      { type: 'tool_start', name: 'sum_transactions' },
      { type: 'tool_end', name: 'sum_transactions' },
      { type: 'token', value: 'R$ 42' },
      { type: 'done', success: true, chatId: 'chat-1', answer: 'R$ 42', toolsUsed: ['sum_transactions'] },
    ])

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('total?', null)
    })

    const assistant = useChatStore.getState().messages[1]
    expect(assistant.tools).toEqual([{ name: 'sum_transactions', status: 'done' }])
    expect(assistant.text).toBe('R$ 42')
  })

  it('remembers the chatId and continues the same conversation', async () => {
    scriptStream([{ type: 'done', success: true, chatId: 'chat-1', answer: 'hi' }])

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('first message', null)
    })

    expect(useChatStore.getState().chatId).toBe('chat-1')

    await act(async () => {
      await result.current('second message', null)
    })

    expect(mockedStream).toHaveBeenLastCalledWith(
      [{ type: 'text', content: 'second message' }],
      expect.any(Function),
      'chat-1',
      '1'
    )
  })

  it('clears a stale chatId when the server rejects it', async () => {
    useChatStore.setState({ chatId: 'deleted-chat' })
    scriptStream([{ type: 'done', success: false, error: 'Chat not found' }])

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('hello?', null)
    })

    expect(useChatStore.getState().chatId).toBeNull()
    expect(useChatStore.getState().messages[1]).toMatchObject({
      error: true,
      text: 'Chat not found',
    })
  })

  it('keeps the chat thread and surfaces the clear message when the AI usage limit is hit', async () => {
    useChatStore.setState({ chatId: 'chat-1' })
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

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('how much did I spend?', null)
    })

    // Unlike a deleted/foreign chat, a credit-limit failure still returns the
    // chatId, so the thread is preserved instead of being reset.
    expect(useChatStore.getState().chatId).toBe('chat-1')

    const assistant = useChatStore.getState().messages[1]
    expect(assistant).toMatchObject({ error: true })
    expect(assistant.text).toContain('usage limit')

    expect(toast.error).toHaveBeenCalledWith(
      'AI usage limit reached. Please try again later.'
    )
  })

  it('routes an attachment through streamChat so the chat is persisted', async () => {
    const compressed = new Blob(['tiny'], { type: 'image/jpeg' })
    mockedCompress.mockResolvedValue(compressed)
    mockedToBase64.mockResolvedValue('BASE64')
    scriptStream([
      { type: 'done', success: true, chatId: 'chat-9', answer: 'Added R$ 10' },
    ])

    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('', { file, kind: 'image', previewUrl: 'data:preview' })
    })

    expect(mockedCompress).toHaveBeenCalledWith(file)
    expect(mockedToBase64).toHaveBeenCalledWith(compressed)
    expect(mockedStream).toHaveBeenCalledWith(
      [
        { type: 'text', content: 'Please scan this receipt.' },
        { type: 'image', content: 'BASE64' },
      ],
      expect.any(Function),
      undefined,
      '1'
    )
    expect(useChatStore.getState().chatId).toBe('chat-9')

    const messages = useChatStore.getState().messages
    expect(messages[0]).toMatchObject({ imageDataUrl: 'data:preview' })
    expect(messages[1]).toMatchObject({ pending: false, text: 'Added R$ 10' })
  })

  it('sends audio attachments without compressing them', async () => {
    mockedToBase64.mockResolvedValue('AUDIO64')
    scriptStream([{ type: 'done', success: true, chatId: 'chat-1', answer: 'ok' }])

    const file = new File(['x'], 'note.webm', { type: 'audio/webm' })
    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('', { file, kind: 'audio' })
    })

    expect(mockedCompress).not.toHaveBeenCalled()
    expect(mockedToBase64).toHaveBeenCalledWith(file)
  })

  it('marks the assistant message as an error when the scan fails', async () => {
    mockedCompress.mockImplementation(async (file: File) => file)
    mockedToBase64.mockResolvedValue('BASE64')
    scriptStream([{ type: 'done', success: false, error: 'no transactions found' }])

    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('scan it', { file, kind: 'image' })
    })

    expect(useChatStore.getState().messages[1]).toMatchObject({
      error: true,
      text: 'no transactions found',
    })
  })

  it('shows an error message when the request throws', async () => {
    mockedStream.mockRejectedValue(new Error('network'))

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('hi', null)
    })

    expect(useChatStore.getState().messages[1]).toMatchObject({ error: true })
  })

  it('ignores empty submissions', async () => {
    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('   ', null)
    })

    expect(useChatStore.getState().messages).toHaveLength(0)
    expect(mockedStream).not.toHaveBeenCalled()
  })
})
