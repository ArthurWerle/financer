import { BFF_BASE_URL } from '@/constants'
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
        >(`${BFF_BASE_URL}/categories/average`)
        .then((res) => res.data),
  })
}
