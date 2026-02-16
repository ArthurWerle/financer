import { BFF_BASE_URL } from '@/constants'
import { TransactionV2Response } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/latest-transactions'

export const useLatestTransactions = () => {
  return useQuery<TransactionV2Response>({
    queryKey: [KEY],
    queryFn: () => {
      return api
        .get<TransactionV2Response>(`${BFF_BASE_URL}  /transactions/latest`)
        .then((res) => res.data)
    },
    refetchOnWindowFocus: false,
  })
}
