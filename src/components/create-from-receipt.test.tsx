import { render, screen, fireEvent, waitFor } from '@/utils/test-utils'
import { CreateFromReceipt } from './create-from-receipt'
import { proposeReceipt, refineReceipt } from '@/queries/receipts/proposeReceipt'
import { addTransactionV2 } from '@/queries/transactions/addTransaction'

jest.mock('@/queries/categories/useCategories', () => ({
  useCategories: () => ({ data: [{ id: 2, name: 'Grocery' }] }),
}))
jest.mock('@/queries/subcategories/useSubcategories', () => ({
  useSubcategories: () => ({ data: [] }),
}))
jest.mock('@/queries/receipts/proposeReceipt', () => ({
  proposeReceipt: jest.fn(),
  refineReceipt: jest.fn(),
}))
jest.mock('@/queries/transactions/addTransaction', () => ({
  addTransactionV2: jest.fn(),
}))
jest.mock('@/utils/compressImage', () => ({
  compressImage: jest.fn(async (file: File) => file),
}))
jest.mock('@/queries/chat/sendChat', () => ({
  fileToBase64: jest.fn(async () => 'base64data'),
}))
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

const mockPropose = proposeReceipt as jest.Mock
const mockRefine = refineReceipt as jest.Mock
const mockAdd = addTransactionV2 as jest.Mock

const ITEM = {
  categoryId: 2,
  datetime: '2026-09-12T15:21:26',
  value: 10,
  description: 'Coffee',
}

const selectFileAndScan = () => {
  // Radix Dialog portals its content to document.body, so query the document.
  const input = document.querySelector(
    'input[type="file"]'
  ) as HTMLInputElement
  const file = new File(['x'], 'receipt.jpg', { type: 'image/jpeg' })
  fireEvent.change(input, { target: { files: [file] } })
  fireEvent.click(screen.getByRole('button', { name: 'Ler nota' }))
}

describe('CreateFromReceipt', () => {
  beforeEach(() => {
    mockAdd.mockResolvedValue({})
  })

  it('uploads, shows the proposal for review, and only creates on confirm', async () => {
    mockPropose.mockResolvedValue({ success: true, items: [ITEM] })
    const onOpenChange = jest.fn()

    render(
      <CreateFromReceipt open onOpenChange={onOpenChange} />
    )

    selectFileAndScan()

    // Review step renders the proposal, resolving the category name from its id.
    expect(await screen.findByText('Criarei essas transações:')).toBeInTheDocument()
    expect(screen.getByText(/Coffee/)).toBeInTheDocument()
    expect(screen.getByText(/Grocery/)).toBeInTheDocument()

    // Nothing is created until the user confirms.
    expect(mockAdd).not.toHaveBeenCalled()

    fireEvent.click(
      screen.getByRole('button', { name: /Confirmar e criar/ })
    )

    await waitFor(() => expect(mockAdd).toHaveBeenCalledTimes(1))
    expect(mockAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 10,
        category_id: 2,
        description: 'Coffee',
        type: 'expense',
        is_recurring: false,
        date: '2026-09-12T15:21:26-03:00',
      })
    )
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('sends a correction message to refine the proposal without creating', async () => {
    mockPropose.mockResolvedValue({ success: true, items: [ITEM] })
    mockRefine.mockResolvedValue({
      success: true,
      items: [{ ...ITEM, categoryId: 2, description: 'Café' }],
    })

    render(<CreateFromReceipt open onOpenChange={jest.fn()} />)
    selectFileAndScan()
    await screen.findByText('Criarei essas transações:')

    const textarea = screen.getByPlaceholderText(/muda a categoria/)
    fireEvent.change(textarea, {
      target: { value: 'muda a descrição do café' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar correção' }))

    await waitFor(() =>
      expect(mockRefine).toHaveBeenCalledWith([ITEM], 'muda a descrição do café')
    )
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it('blocks confirm while an item is missing a category', async () => {
    mockPropose.mockResolvedValue({
      success: true,
      items: [{ ...ITEM, categoryId: undefined }],
    })

    render(<CreateFromReceipt open onOpenChange={jest.fn()} />)
    selectFileAndScan()
    await screen.findByText('Criarei essas transações:')

    expect(
      screen.getByRole('button', { name: /Confirmar e criar/ })
    ).toBeDisabled()
    expect(screen.getByText(/Sem categoria/)).toBeInTheDocument()
  })
})
