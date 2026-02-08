import {
  TRANSACTION_SERVICE_BASE_URL,
  TRANSACTION_V2_SERVICE_BASE_URL,
} from '@/constants'
import { Transaction, TransactionV2Response } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/biggest-transactions'
export const LIMIT = 3

type BiggestTransactionsResponseType = {
  amount: number
  description: string
  sortDate: string
  date: string
  typeName: 'income' | 'expense'
  categoryName: string
}

export const useBiggestTransactions = () => {
  return useQuery<Transaction[] | TransactionV2Response>({
    queryKey: [KEY],
    queryFn: () => {
      if (process.env.NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true') {
        return api
          .get<TransactionV2Response>(
            `${TRANSACTION_V2_SERVICE_BASE_URL}/v2/transactions/biggest`
          )
          .then((res) => res.data)
      }

      return api
        .get<
          Transaction[]
        >(`${TRANSACTION_SERVICE_BASE_URL}/combined-transactions/biggest/${LIMIT}`)
        .then((res) => res.data)
    },
    select: (data) => {
      if (!Array.isArray(data)) return data

      return data.map((transaction) => ({
        ...transaction,
        date: transaction.sortDate!,
      }))
    },
    refetchOnWindowFocus: false,
  })
}
