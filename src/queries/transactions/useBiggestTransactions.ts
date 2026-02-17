import { BFF_BASE_URL } from '@/constants'
import { TransactionResponse } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/biggest-transactions'

export const useBiggestTransactions = () => {
  return useQuery<TransactionResponse>({
    queryKey: [KEY],
    queryFn: () => {
      return api
        .get<TransactionResponse>(`${BFF_BASE_URL}/transactions/biggest`)
        .then((res) => res.data)
    },
    refetchOnWindowFocus: false,
  })
}
