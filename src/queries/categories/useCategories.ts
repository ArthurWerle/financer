import { BFF_BASE_URL } from '@/constants'
import { CategoryResponse } from '@/types/category'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/categories'

export const useCategories = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<CategoryResponse>(`${BFF_BASE_URL}/categories`)
        .then((res) => res.data),
    refetchOnWindowFocus: false,
    select: (data) => data.categories,
  })
}
