import { BFF_BASE_URL } from "@/constants"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/categories-monthly-expense'

export const useCategoriesMonthyExpense = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<Record<string, number>>(`${BFF_BASE_URL}/monthly-expenses-by-category`).then((res) => res.data),
    refetchOnWindowFocus: false
  })
}