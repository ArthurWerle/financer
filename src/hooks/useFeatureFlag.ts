import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/feature-flags/check'

// Whether a feature flag is enabled for the logged-in user
// (globally enabled OR explicitly assigned to the user)
export const useFeatureFlag = (key: string) => {
  const { data, isLoading } = useQuery<{ enabled: boolean }>({
    queryKey: [KEY, key],
    queryFn: () => {
      return api
        .get<{ enabled: boolean }>(`${BFF_BASE_URL}/feature-flags/check`, {
          params: { key },
        })
        .then((res) => res.data)
    },
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  })

  return { enabled: data?.enabled ?? false, isLoading }
}
