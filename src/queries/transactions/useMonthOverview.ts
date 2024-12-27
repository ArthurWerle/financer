import { BFF_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

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

export const useMonthOverview = () => {
  return useQuery({
    queryKey: ['/overview/by-month'],
    queryFn: () => api.get<MonthOverviewResponse>(`${BFF_BASE_URL}/overview/by-month`).then((res) => res.data),
  })
}