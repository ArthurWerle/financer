import { BFF_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/categories-monthly-expense'

export const useCategoriesMonthyExpense = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<Record<string, number>>(`${BFF_BASE_URL}/monthly-expenses-by-category`).then((res) => res.data),
  })
}