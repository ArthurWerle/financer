import { API_V2_BASE_URL } from '@/constants'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export type CategoryAverage = {
  category_id: number
  category_name: string
  average: number
  total_spent: number
}

type AverageByCategoryResponse = {
  averageByCategory: CategoryAverage[]
}

export const KEY = 'transactions/average/by-category'

export const useAverageByCategory = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<AverageByCategoryResponse>(
          `${API_V2_BASE_URL}/transactions/average/by-category`
        )
        .then((res) => res.data.averageByCategory),
    refetchOnWindowFocus: false,
  })
}
