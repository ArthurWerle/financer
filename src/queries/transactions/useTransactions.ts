import { BFF_BASE_URL } from '@/constants'
import { TransactionResponse } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/all-transactions'

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
  return useQuery<TransactionResponse>({
    queryKey: [KEY, JSON.stringify(filters)],
    queryFn: () => {
      return api
        .get<TransactionResponse>(`${BFF_BASE_URL}/transactions`, {
          params: getFilterParams(filters),
        })
        .then((res) => res.data)
    },
    refetchOnWindowFocus: false,
  })
}
