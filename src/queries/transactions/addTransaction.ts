import { BFF_BASE_URL } from '@/constants'
import { Transaction } from '@/types/transaction'
import api from '@/utils/api'

export type PostTransactionTypeV2 = Pick<
  Transaction,
  | 'amount'
  | 'type'
  | 'created_by_id'
  | 'is_recurring'
  | 'frequency'
  | 'category_id'
  | 'description'
  | 'date'
> & { end_date?: string }

export const addTransactionV2 = async (transaction: PostTransactionTypeV2) => {
  return await api.post(`${BFF_BASE_URL}/transactions`, transaction)
}
