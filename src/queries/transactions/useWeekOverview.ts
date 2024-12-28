import { BFF_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/overview/by-week'

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
    queryKey: [KEY],
    queryFn: () => api.get<WeekOverview>(`${BFF_BASE_URL}/overview/by-week`).then((res) => res.data),
  })
}