import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/projections/current-month'

export type MonthProjection = {
  month: string
  recurring_committed: number
  one_off_spent: number
  projected_one_off: number
  projected_total: number
}

export const useMonthProjection = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<MonthProjection>(`${BFF_BASE_URL}/projections/current-month`)
        .then((res) => res.data),
    refetchOnWindowFocus: false,
  })
}
