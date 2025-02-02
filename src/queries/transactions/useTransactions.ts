import { BFF_BASE_URL, TRANSACTION_SERVICE_BASE_URL } from "@/src/constants"
import { RecurringTransaction } from "@/src/types/recurring-transaction"
import { Transaction } from "@/src/types/transaction"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

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
  console.log({ filters })
  return useQuery({
    queryKey: [KEY, JSON.stringify(filters)],
    queryFn: () => {
      return api.get<TransactionResponseType[]>(`${TRANSACTION_SERVICE_BASE_URL}/combined-transactions/all`, { params: getFilterParams(filters)}).then((res) => res.data)
    },
    refetchOnWindowFocus: false
  })
}