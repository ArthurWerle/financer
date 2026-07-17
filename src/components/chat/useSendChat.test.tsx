import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useSendChat } from './useSendChat'
import { useChatStore } from '@/stores/useChatStore'
import { scanReceipt, askQuestion, fileToBase64 } from '@/queries/chat/sendChat'
import { compressImage } from '@/utils/compressImage'

jest.mock('@/queries/chat/sendChat')
jest.mock('@/utils/compressImage')
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }))

const mockedScan = scanReceipt as jest.Mock
const mockedAsk = askQuestion as jest.Mock
const mockedToBase64 = fileToBase64 as jest.Mock
const mockedCompress = compressImage as jest.Mock

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

  it('routes a text-only message to askQuestion', async () => {
    mockedAsk.mockResolvedValue({
      success: true,
      chatId: 'chat-1',
      answer: 'You spent R$ 100',
    })

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('How much did I spend?', null)
    })

    expect(mockedAsk).toHaveBeenCalledWith(
      [{ type: 'text', content: 'How much did I spend?' }],
      undefined
    )
    expect(mockedScan).not.toHaveBeenCalled()

    const messages = useChatStore.getState().messages
    expect(messages).toHaveLength(2)
    expect(messages[0]).toMatchObject({ role: 'user', text: 'How much did I spend?' })
    expect(messages[1]).toMatchObject({
      role: 'assistant',
      pending: false,
      text: 'You spent R$ 100',
    })
  })

  it('remembers the chatId and continues the same conversation', async () => {
    mockedAsk.mockResolvedValue({ success: true, chatId: 'chat-1', answer: 'hi' })

    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('first message', null)
    })

    expect(useChatStore.getState().chatId).toBe('chat-1')

    await act(async () => {
      await result.current('second message', null)
    })

    expect(mockedAsk).toHaveBeenLastCalledWith(
      [{ type: 'text', content: 'second message' }],
      'chat-1'
    )
  })

  it('clears a stale chatId when the server rejects it', async () => {
    useChatStore.setState({ chatId: 'deleted-chat' })
    mockedAsk.mockResolvedValue({ success: false, error: 'Chat not found' })

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

  it('routes an attachment through askQuestion so the chat is persisted', async () => {
    const compressed = new Blob(['tiny'], { type: 'image/jpeg' })
    mockedCompress.mockResolvedValue(compressed)
    mockedToBase64.mockResolvedValue('BASE64')
    mockedAsk.mockResolvedValue({
      success: true,
      chatId: 'chat-9',
      answer: 'Added R$ 10',
    })

    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useSendChat(), { wrapper })
    await act(async () => {
      await result.current('', { file, kind: 'image', previewUrl: 'data:preview' })
    })

    expect(mockedCompress).toHaveBeenCalledWith(file)
    expect(mockedToBase64).toHaveBeenCalledWith(compressed)
    expect(mockedAsk).toHaveBeenCalledWith(
      [
        { type: 'text', content: 'Please scan this receipt.' },
        { type: 'image', content: 'BASE64' },
      ],
      undefined
    )
    expect(mockedScan).not.toHaveBeenCalled()
    expect(useChatStore.getState().chatId).toBe('chat-9')

    const messages = useChatStore.getState().messages
    expect(messages[0]).toMatchObject({ imageDataUrl: 'data:preview' })
    expect(messages[1]).toMatchObject({ pending: false, text: 'Added R$ 10' })
  })

  it('sends audio attachments without compressing them', async () => {
    mockedToBase64.mockResolvedValue('AUDIO64')
    mockedAsk.mockResolvedValue({ success: true, chatId: 'chat-1', answer: 'ok' })

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
    mockedAsk.mockResolvedValue({ success: false, error: 'no transactions found' })

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
    mockedAsk.mockRejectedValue(new Error('network'))

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
    expect(mockedAsk).not.toHaveBeenCalled()
  })
})
