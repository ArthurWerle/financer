import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export type CategoryAverage = {
  category_id: number
  category_name: string
  average: number
  total_spent: number
  percent_of_income?: number
}

type AverageByCategoryResponse = {
  averageByCategory: CategoryAverage[]
  total_income: number
}

export const KEY = 'transactions/average/by-category'

type Params = {
  start_date?: string
  end_date?: string
}

export const useAverageByCategory = (params?: Params) => {
  return useQuery({
    queryKey: [KEY, params?.start_date, params?.end_date],
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
