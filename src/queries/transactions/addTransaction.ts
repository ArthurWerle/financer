import { BFF_BASE_URL, TRANSACTION_V2_SERVICE_BASE_URL } from '@/constants'
import { RecurringTransaction } from '@/types/recurring-transaction'
import { Transaction, TransactionV2 } from '@/types/transaction'
import api from '@/utils/api'

type PostTransactionType = Partial<
  Omit<Transaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt'> &
    Omit<
      RecurringTransaction,
      'id' | 'typeName' | 'createdAt' | 'updatedAt' | 'lastOccurrence'
    >
>

export type PostTransactionTypeV2 = Pick<
  TransactionV2,
  | 'amount'
  | 'type'
  | 'created_by_id'
  | 'is_recurring'
  | 'frequency'
  | 'category_id'
  | 'description'
  | 'date'
> & { end_date?: string }

export const addTransaction = async (transaction: PostTransactionType) => {
  const isRecurring = transaction?.frequency?.length ?? 0 > 0

  if (isRecurring) {
    return await api.post(`${BFF_BASE_URL}/recurring-transactions`, transaction)
  }

  return await api.post(`${BFF_BASE_URL}/transactions`, transaction)
}

export const addTransactionV2 = async (transaction: PostTransactionTypeV2) => {
  return await api.post(
    `${TRANSACTION_V2_SERVICE_BASE_URL}/v2/transactions`,
    transaction
  )
}
