import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { format, parse } from 'date-fns'
import type { Transaction } from '@/types/transaction'
import {
  changeRecurringAmount,
  ChangeRecurringAmountResponse,
} from '@/queries/transactions/changeRecurringAmount'
import { invalidateTransactionQueries } from '@/queries/transactions/invalidateTransactionQueries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { numberToCurrency } from '@/utils/number-to-currency'

const currentMonth = () => format(new Date(), 'yyyy-MM')

// The BFF wraps the backend's { error, details } body under `cause`.
const errorDetails = (error: unknown) => {
  const data = (error as { response?: { data?: { cause?: { details?: string } } } })
    ?.response?.data
  return data?.cause?.details || (error as Error)?.message
}

export function ChangeAmountDialog({
  transaction,
  open,
  onOpenChange,
  onChanged,
}: {
  transaction: Transaction
  open: boolean
  onOpenChange: (open: boolean) => void
  onChanged?: (result: ChangeRecurringAmountResponse) => void
}) {
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState(String(transaction.amount))
  const [month, setMonth] = useState(currentMonth())
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setAmount(String(transaction.amount))
      setMonth(currentMonth())
    }
  }, [open, transaction.amount])

  const parsedAmount = parseFloat(amount)
  const isValid =
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount !== transaction.amount &&
    /^\d{4}-\d{2}$/.test(month)

  const monthLabel = (value: string) =>
    format(parse(value, 'yyyy-MM', new Date()), 'MMM yyyy')

  const handleSubmit = async () => {
    if (!isValid) return
    setIsSubmitting(true)
    await changeRecurringAmount(transaction.id, parsedAmount, `${month}-01`)
      .then(async ({ data }) => {
        toast.success(`Amount changed from ${monthLabel(month)}`)
        await invalidateTransactionQueries(queryClient)
        onOpenChange(false)
        onChanged?.(data)
      })
      .catch((error) => {
        toast.error(
          `ERROR: ${errorDetails(error) || 'Error changing recurring amount'}`
        )
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change amount</DialogTitle>
          <DialogDescription>
            Months before the chosen one keep the current amount, so past
            reports stay the same.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="change-amount-value">New amount</Label>
            <Input
              id="change-amount-value"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="change-amount-month">Starting from</Label>
            <Input
              id="change-amount-month"
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>
          {isValid && (
            <p className="text-sm text-muted-foreground">
              {numberToCurrency(transaction.amount)} until the month before{' '}
              {monthLabel(month)}, {numberToCurrency(parsedAmount)} from{' '}
              {monthLabel(month)} on.
            </p>
          )}
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Confirm'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
