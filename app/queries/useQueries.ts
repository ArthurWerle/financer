import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../utils/api"

export const useUserProfile = () => {
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: () => api.get("/users/profile").then((res: any) => res.data),
  })
}

export const useMonthlyExpenses = (year: number, month: number) => {
  return useQuery({
    queryKey: ["monthlyExpenses", year, month],
    queryFn: () =>
      api
        .get(`/analytics/monthly-expenses?year=${year}&month=${month}`)
        .then((res) => res.data),
  })
}

export const useAnnualIncome = (year: number) => {
  return useQuery({
    queryKey: ["annualIncome", year],
    queryFn: () =>
      api.get(`/analytics/annual-income?year=${year}`).then((res) => res.data),
  })
}
