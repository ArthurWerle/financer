import { BFF_BASE_URL } from '@/constants'
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

type Params = {
  startDate?: string
  endDate?: string
}

export const useAverageByCategory = (params?: Params) => {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () =>
      api
        .get<AverageByCategoryResponse>(
          `${BFF_BASE_URL}/transactions/average/by-category`,
          { params }
        )
        .then((res) => res.data.averageByCategory),
    refetchOnWindowFocus: false,
  })
}
