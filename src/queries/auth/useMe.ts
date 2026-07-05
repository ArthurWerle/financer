import { BFF_BASE_URL } from '@/constants'
import { User } from '@/types/auth'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/auth/me'

export const useMe = () => {
  return useQuery<User>({
    queryKey: [KEY],
    queryFn: () => {
      return api.get<User>(`${BFF_BASE_URL}/auth/me`).then((res) => res.data)
    },
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })
}
