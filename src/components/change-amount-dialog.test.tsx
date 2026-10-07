import { rest } from 'msw'
import { format } from 'date-fns'
import { render, screen, fireEvent, waitFor } from '../utils/test-utils'
import { server } from '../tests/mocks/server'
import { ChangeAmountDialog } from '@/components/change-amount-dialog'
import type { Transaction } from '@/types/transaction'

const BFF_BASE_URL = 'http://localhost:8082/api/bff'

describe('ChangeAmountDialog', () => {
  const internet: Transaction = {
    id: 9,
    description: 'Internet',
    category_id: 1,
    amount: 149,
    type: 'expense',
    date: '',
    is_recurring: true,
    is_prepaid: false,
    start_date: '2025-01-01T00:00:00Z',
    created_at: '2025-01-01',
    updated_at: '2025-01-01',
  }

  it('posts the new amount from the chosen month', async () => {
    let body: unknown
    server.use(
      rest.post(
        `${BFF_BASE_URL}/transactions/9/change-amount`,
        async (req, res, ctx) => {
          body = await req.json()
          return res(
            ctx.json({
              message: 'ok',
              previous: { ...internet, end_date: '2026-09-30T00:00:00Z' },
              current: { ...internet, id: 10, amount: 129, previous_id: 9 },
              effective_from: '2026-10-01',
            })
          )
        }
      )
    )
    const onChanged = jest.fn()
    const onOpenChange = jest.fn()

    render(
      <ChangeAmountDialog
        transaction={internet}
        open
        onOpenChange={onOpenChange}
        onChanged={onChanged}
      />
    )

    const confirm = screen.getByRole('button', { name: 'Confirm' })
    expect(confirm).toBeDisabled()

    fireEvent.change(screen.getByLabelText('New amount'), {
      target: { value: '129' },
    })
    expect(screen.getByLabelText('Starting from')).toHaveValue(
      format(new Date(), 'yyyy-MM')
    )
    fireEvent.change(screen.getByLabelText('Starting from'), {
      target: { value: '2026-11' },
    })
    fireEvent.click(confirm)

    await waitFor(() => expect(onChanged).toHaveBeenCalled())
    expect(body).toEqual({ amount: 129, effective_from: '2026-11-01' })
    expect(onChanged.mock.calls[0][0].current.id).toBe(10)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('keeps confirm disabled when the amount is unchanged', () => {
    render(
      <ChangeAmountDialog transaction={internet} open onOpenChange={jest.fn()} />
    )
    expect(screen.getByLabelText('New amount')).toHaveValue(149)
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeDisabled()
  })
})
