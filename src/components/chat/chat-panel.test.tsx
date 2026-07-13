import { render, screen, fireEvent, act } from '@testing-library/react'
import { ChatPanel } from './chat-panel'
import { useChatStore } from '@/stores/useChatStore'
import { askQuestion } from '@/queries/chat/sendChat'

jest.mock('@/queries/chat/sendChat')
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }))

const mockedAsk = askQuestion as jest.Mock

describe('ChatPanel', () => {
  beforeEach(() => {
    useChatStore.setState({ isOpen: true, messages: [] })
    jest.clearAllMocks()
    mockedAsk.mockResolvedValue({ success: true, data: { answer: 'ok' } })
  })

  it('shows the empty state with suggestions', () => {
    render(<ChatPanel />)
    expect(screen.getByText('Financer Assistant')).toBeInTheDocument()
    expect(
      screen.getByText('How much did I spend this month?')
    ).toBeInTheDocument()
  })

  it('renders a conversation with a scanned transaction', () => {
    useChatStore.setState({
      isOpen: true,
      messages: [
        { id: 'u1', role: 'user', text: 'scan this' },
        {
          id: 'a1',
          role: 'assistant',
          text: 'Added your coffee',
          transactions: [{ description: 'Coffee', amount: 12.5 }],
        },
      ],
    })

    render(<ChatPanel />)
    expect(screen.getByText('scan this')).toBeInTheDocument()
    expect(screen.getByText('Added your coffee')).toBeInTheDocument()
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    expect(screen.getByText(/R\$\s?12[.,]50/)).toBeInTheDocument()
  })

  it('sends a typed message through the composer', async () => {
    render(<ChatPanel />)

    const textarea = screen.getByPlaceholderText(
      'Ask a question or attach a receipt…'
    )
    fireEvent.change(textarea, { target: { value: 'How much did I spend?' } })

    await act(async () => {
      fireEvent.click(screen.getByLabelText('Send message'))
    })

    expect(mockedAsk).toHaveBeenCalledWith('How much did I spend?')
    expect(
      useChatStore
        .getState()
        .messages.some((message) => message.text === 'How much did I spend?')
    ).toBe(true)
  })
})
