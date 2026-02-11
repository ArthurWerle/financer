import { BFF_BASE_URL } from '@/constants'
import { Transaction, TransactionV2Response } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/latest-transactions'
export const LIMIT = 3

export const useLatestTransactions = () => {
  return useQuery<Transaction[] | TransactionV2Response>({
    queryKey: [KEY],
    queryFn: () => {
      if (process.env.NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true') {
        return api
          .get<TransactionV2Response>(
            `${BFF_BASE_URL}/v2/transactions/latest`
          )
          .then((res) => res.data)
      }

      return api
        .get<
          Transaction[]
        >(`${BFF_BASE_URL}/transactions/latest`)
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
