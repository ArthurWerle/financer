import { act, fireEvent, render, screen, waitFor } from '@/utils/test-utils'
import { NewExpenseMenu } from './new-expense-menu'

jest.mock('@/queries/categories/useCategories', () => ({
  useCategories: () => ({ data: [{ id: 1, name: 'Grocery' }], isLoading: false }),
}))
jest.mock('@/queries/subcategories/useSubcategories', () => ({
  useSubcategories: () => ({ data: [], isLoading: false }),
}))
jest.mock('@/queries/locations/useLocations', () => ({
  KEY: '/locations',
  useLocations: () => ({ data: [], isLoading: false }),
}))
jest.mock('@/queries/transactions/addTransaction', () => ({
  addTransactionV2: jest.fn(async () => ({})),
}))
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}))

// jsdom has no layout, so Radix's pointer capture helpers are missing.
beforeAll(() => {
  Element.prototype.hasPointerCapture = jest.fn(() => false)
  Element.prototype.setPointerCapture = jest.fn()
  Element.prototype.releasePointerCapture = jest.fn()
})

afterEach(() => {
  document.body.style.removeProperty('pointer-events')
})

// Waits for the two requestAnimationFrame hops the guard uses.
const flushFrames = async () => {
  await act(async () => {
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    )
  })
}

const openManualEntry = async () => {
  // Radix opens the menu on pointerdown/keydown, not on a plain click.
  fireEvent.keyDown(screen.getByRole('button', { name: /new expense/i }), {
    key: 'Enter',
  })
  const item = await screen.findByRole('menuitem', { name: /manual entry/i })
  fireEvent.click(item)
  await waitFor(() =>
    expect(screen.getByRole('heading', { name: 'New expense' })).toBeInTheDocument()
  )
}

describe('NewExpenseMenu', () => {
  it('opens the manual form from the menu', async () => {
    render(<NewExpenseMenu />)
    await openManualEntry()
  })

  // End-to-end check on the path that froze the app: menu -> dialog -> close
  // has to leave <body> interactive. The specific way it broke (two copies of
  // @radix-ui/react-dismissable-layer keeping separate pointer-events
  // bookkeeping) only reproduces against the real dependency tree; the unit
  // guard that catches a stuck body is covered in ui/dialog.test.tsx.
  it('leaves the body clickable after the dialog closes', async () => {
    render(<NewExpenseMenu />)
    await openManualEntry()

    fireEvent.keyDown(document.activeElement || document.body, { key: 'Escape' })
    await waitFor(() =>
      expect(
        screen.queryByRole('heading', { name: 'New expense' })
      ).not.toBeInTheDocument()
    )

    await flushFrames()
    expect(document.body.style.pointerEvents).not.toBe('none')
  })
})
