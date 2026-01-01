import {
  TRANSACTION_SERVICE_BASE_URL,
  TRANSACTION_V2_SERVICE_BASE_URL,
} from '@/constants'
import { RecurringTransaction } from '@/types/recurring-transaction'
import { Transaction, TransactionV2Response } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/all-transactions'

type TransactionResponseType = Transaction & RecurringTransaction
type UseTransactionsProps = {
  filters: {
    category?: string[]
    currentMonth?: string
  }
}

const getFilterParams = (filters: UseTransactionsProps['filters']) => {
  const params: Record<string, string> = {}

  if (filters.category?.length) {
    params.category = filters.category.join(',')
  }

  if (filters.currentMonth?.trim()) {
    params.currentMonth = filters.currentMonth
  }

  return params
}

export const useTransactions = ({ filters }: UseTransactionsProps) => {
  return useQuery<TransactionResponseType[] | TransactionV2Response>({
    queryKey: [
      KEY,
      process.env.NEXT_PUBLIC_USE_TRANSACTIONS_V2,
      JSON.stringify(filters),
    ],
    queryFn: () => {
      if (process.env.NEXT_PUBLIC_USE_TRANSACTIONS_V2) {
        return api
          .get<TransactionV2Response>(
            `${TRANSACTION_V2_SERVICE_BASE_URL}/v2/transactions`,
            { params: getFilterParams(filters) }
          )
          .then((res) => res.data)
      }

      return api
        .get<
          TransactionResponseType[]
        >(`${TRANSACTION_SERVICE_BASE_URL}/combined-transactions/all`, { params: getFilterParams(filters) })
        .then((res) => res.data)
    },
    refetchOnWindowFocus: false,
  })
}
