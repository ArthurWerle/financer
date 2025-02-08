import { TRANSACTION_SERVICE_BASE_URL } from "@/src/constants"
import { RecurringTransaction } from "@/src/types/recurring-transaction"
import { Transaction } from "@/src/types/transaction"
import api from "@/src/utils/api"


type PostTransactionType = Partial<
  Omit<Transaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt'> &
  Omit<RecurringTransaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt' | 'lastOccurrence'>>

export const addTransaction = async (transaction: PostTransactionType) => {
  const isRecurring = transaction?.frequency?.length ?? 0 > 0

  if (isRecurring) {
    console.log('isRecurring', transaction)
    return await api.post(`${TRANSACTION_SERVICE_BASE_URL}/recurring-transactions`, transaction)
  }

  return await api.post(`${TRANSACTION_SERVICE_BASE_URL}/transactions`, transaction)
}