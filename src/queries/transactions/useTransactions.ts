import { BFF_BASE_URL } from '@/constants'
import { TransactionResponse } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/all-transactions'

type UseTransactionsProps = {
  filters: {
    category?: string[]
    currentMonth?: string
    query?: string
    start_date?: string
    end_date?: string
    type?: string
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

  if (filters.query?.trim()) {
    params.query = filters.query.trim()
  }

  if (filters.start_date?.trim()) {
    params.start_date = filters.start_date
  }

  if (filters.end_date?.trim()) {
    params.end_date = filters.end_date
  }

  if (filters.type?.trim()) {
    params.type = filters.type
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
