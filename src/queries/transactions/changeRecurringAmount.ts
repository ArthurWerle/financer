import { BFF_BASE_URL } from '@/constants'
import { Transaction } from '@/types/transaction'
import api from '@/utils/api'

export type ChangeRecurringAmountResponse = {
  message: string
  /** Null when the schedule had not started yet and was edited in place. */
  previous: Transaction | null
  current: Transaction
  effective_from: string
}

/**
 * Changes a recurring transaction's amount from `effectiveFrom`'s month on
 * (YYYY-MM-DD, defaults to the current month). Earlier months keep the old
 * amount: the backend ends the current schedule and creates a new one.
 */
export const changeRecurringAmount = async (
  id: number,
  amount: number,
  effectiveFrom?: string
) => {
  return await api.post<ChangeRecurringAmountResponse>(
    `${BFF_BASE_URL}/transactions/${id}/change-amount`,
    { amount, effective_from: effectiveFrom }
  )
}
