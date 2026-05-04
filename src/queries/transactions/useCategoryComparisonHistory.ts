import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/category-comparison-history'

type CategoryHistoryDataPoint = {
  month: string
  expense: number
  income: number
}

export type CategoryComparisonHistory = {
  category_id: number
  category_name: string
  color: string
  data: CategoryHistoryDataPoint[]
}

type Params = {
  start_date?: string
  end_date?: string
  category?: string
}

export const useCategoryComparisonHistory = (params: Params = {}) => {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () =>
      api
        .get<CategoryComparisonHistory[]>(
          `${BFF_BASE_URL}/category-comparison-history`,
          { params }
        )
        .then((res) => res.data),
    refetchOnWindowFocus: false,
  })
}
