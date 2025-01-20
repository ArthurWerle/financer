import { TRANSACTION_SERVICE_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/latest-transactions'
export const LIMIT = 3

type LatestTransactionsResponseType = {
  amount: number
  description: string,
  sortDate: string,
  date: string
  typeName: 'income' | 'expense'
  categoryName: string
}

export const useLatestTransactions = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<LatestTransactionsResponseType[]>(`${TRANSACTION_SERVICE_BASE_URL}/combined-transactions/latest/${LIMIT}`).then((res) => res.data),
    select: (data) => data.map(transaction => ({
      ...transaction,
      date: transaction.sortDate
  })),
    refetchOnWindowFocus: false
  })
}