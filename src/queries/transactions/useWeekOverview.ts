import { BFF_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

type WeekOverview = {
  income: {
    currentWeek: number
    lastWeek: number
    percentageVariation: number
  }
  expense: {
    currentWeek: number
    lastWeek: number
    percentageVariation: number
  }
}

export const useWeekOverview = () => {
  return useQuery({
    queryKey: ['/overview/by-week'],
    queryFn: () => api.get<WeekOverview>(`${BFF_BASE_URL}/overview/by-week`).then((res) => res.data),
  })
}