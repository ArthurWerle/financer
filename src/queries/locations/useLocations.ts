import { BFF_BASE_URL } from '@/constants'
import { LocationResponse } from '@/types/location'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/locations'

export const useLocations = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<LocationResponse>(`${BFF_BASE_URL}/locations`)
        .then((res) => res.data),
    refetchOnWindowFocus: false,
    select: (data) => data.locations,
  })
}
