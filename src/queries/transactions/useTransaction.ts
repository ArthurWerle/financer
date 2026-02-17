import { BFF_BASE_URL } from '@/constants'
import { Transaction } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/transaction'

export const useTransaction = (id: string) => {
  return useQuery<Transaction>({
    queryKey: [KEY, id],
    queryFn: () =>
      api
        .get<Transaction>(`${BFF_BASE_URL}/transactions/${id}`)
        .then((res) => res.data),
    refetchOnWindowFocus: false,
  })
}
