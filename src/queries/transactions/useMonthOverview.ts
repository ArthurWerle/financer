import { BFF_BASE_URL } from "@/constants"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/overview/by-month'

type MonthOverviewResponse = {
  income: {
    currentMonth: number
    lastMonth: number
    percentageVariation: number
  }
  expense: {
    currentMonth: number
    lastMonth: number
    percentageVariation: number
  }
}

type Params = {
  month?: number
  year?: number
}

export const useMonthOverview = (params?: Params) => {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<MonthOverviewResponse>(`${BFF_BASE_URL}/overview/by-month`, { params }).then((res) => res.data),
    refetchOnWindowFocus: false
  })
}