import { BFF_BASE_URL } from '@/constants'
import { TransactionResponse } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/biggest-transactions'

type Params = {
  month?: number
  year?: number
}

export const useBiggestTransactions = (params?: Params) => {
  return useQuery<TransactionResponse>({
    queryKey: [KEY, params],
    queryFn: () => {
      return api
        .get<TransactionResponse>(`${BFF_BASE_URL}/transactions/biggest`, { params })
        .then((res) => res.data)
    },
    refetchOnWindowFocus: false,
  })
}
