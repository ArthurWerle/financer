import { TRANSACTION_SERVICE_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/biggest-transactions'
export const LIMIT = 3

type BiggestTransactionsResponseType = {
  amount: number
  description: string,
  sortDate: string,
  date: string
  typeName: 'income' | 'expense'
  categoryName: string
}

export const useBiggestTransactions = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<BiggestTransactionsResponseType[]>(`${TRANSACTION_SERVICE_BASE_URL}/combined-transactions/biggest/${LIMIT}`).then((res) => res.data),
    select: (data) => data.map(transaction => ({
      ...transaction,
      date: transaction.sortDate
  })),
    refetchOnWindowFocus: false
  })
}