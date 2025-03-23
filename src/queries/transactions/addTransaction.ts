import { TRANSACTION_SERVICE_BASE_URL } from "@/constants"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { Transaction } from "@/types/transaction"
import api from "@/utils/api"


type PostTransactionType = Partial<
  Omit<Transaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt'> &
  Omit<RecurringTransaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt' | 'lastOccurrence'>>

export const addTransaction = async (transaction: PostTransactionType) => {
  const isRecurring = transaction?.frequency?.length ?? 0 > 0

  if (isRecurring) {
    return await api.post(`${TRANSACTION_SERVICE_BASE_URL}/recurring-transactions`, transaction)
  }

  return await api.post(`${TRANSACTION_SERVICE_BASE_URL}/transactions`, transaction)
}