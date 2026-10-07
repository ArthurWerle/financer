import type { Transaction } from '@/types/transaction'

/**
 * Whether a recurring transaction's amount can still be changed from the
 * current month on: it must not be prepaid and must still be running this
 * month. end_date is a calendar date serialized at UTC midnight, so it is
 * read in UTC to avoid slipping into the previous month in local time.
 */
export const canChangeRecurringAmount = (
  transaction: Pick<Transaction, 'is_recurring' | 'is_prepaid' | 'end_date'>,
  now: Date = new Date()
) => {
  if (!transaction.is_recurring || transaction.is_prepaid) return false
  if (!transaction.end_date) return true
  const end = new Date(transaction.end_date)
  const endMonth = end.getUTCFullYear() * 12 + end.getUTCMonth()
  const currentMonth = now.getFullYear() * 12 + now.getMonth()
  return endMonth >= currentMonth
}
