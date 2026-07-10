import { renderHook, act } from '@testing-library/react'
import { useSendChat } from './useSendChat'
import { useChatStore } from '@/stores/useChatStore'
import { scanReceipt, askQuestion, fileToBase64 } from '@/queries/chat/sendChat'

jest.mock('@/queries/chat/sendChat')
jest.mock('react-toastify', () => ({ toast: { error: jest.fn() } }))

const mockedScan = scanReceipt as jest.Mock
const mockedAsk = askQuestion as jest.Mock
const mockedToBase64 = fileToBase64 as jest.Mock

describe('useSendChat', () => {
  beforeEach(() => {
    useChatStore.setState({ isOpen: true, messages: [] })
    jest.clearAllMocks()
  })

  it('routes a text-only message to askQuestion', async () => {
    mockedAsk.mockResolvedValue({ success: true, data: { answer: 'You spent R$ 100' } })

    const { result } = renderHook(() => useSendChat())
    await act(async () => {
      await result.current('How much did I spend?', null)
    })

    expect(mockedAsk).toHaveBeenCalledWith('How much did I spend?')
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

  it('routes an attachment to scanReceipt and stores transactions', async () => {
    mockedToBase64.mockResolvedValue('BASE64')
    mockedScan.mockResolvedValue({
      success: true,
      summary: 'Added R$ 10',
      transactions: [{ description: 'Coffee', amount: 10 }],
    })

    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useSendChat())
    await act(async () => {
      await result.current('', { file, kind: 'image', previewUrl: 'data:preview' })
    })

    expect(mockedScan).toHaveBeenCalledWith([
      { type: 'text', content: 'Please scan this receipt.' },
      { type: 'image', content: 'BASE64' },
    ])

    const messages = useChatStore.getState().messages
    expect(messages[0]).toMatchObject({ imageDataUrl: 'data:preview' })
    expect(messages[1]).toMatchObject({ pending: false, text: 'Added R$ 10' })
    expect(messages[1].transactions).toHaveLength(1)
  })

  it('marks the assistant message as an error when the scan fails', async () => {
    mockedToBase64.mockResolvedValue('BASE64')
    mockedScan.mockResolvedValue({ success: false, error: 'no transactions found' })

    const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })
    const { result } = renderHook(() => useSendChat())
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

    const { result } = renderHook(() => useSendChat())
    await act(async () => {
      await result.current('hi', null)
    })

    expect(useChatStore.getState().messages[1]).toMatchObject({ error: true })
  })

  it('ignores empty submissions', async () => {
    const { result } = renderHook(() => useSendChat())
    await act(async () => {
      await result.current('   ', null)
    })

    expect(useChatStore.getState().messages).toHaveLength(0)
    expect(mockedAsk).not.toHaveBeenCalled()
  })
})
