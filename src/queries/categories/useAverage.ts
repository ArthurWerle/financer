import { ANALYTICS_SERVICE_BASE_URL } from '@/constants'
import { CategoryAverage } from '@/types/category'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const useAverage = () => {
  return useQuery({
    queryKey: ['categories/average'],
    queryFn: () =>
      api
        .get<
          CategoryAverage[]
        >(`${ANALYTICS_SERVICE_BASE_URL}/categories/average`)
        .then((res) => res.data),
  })
}
