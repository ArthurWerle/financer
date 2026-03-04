import { BFF_BASE_URL } from "@/constants"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/categories-monthly-expense'

type Params = {
  month?: number
  year?: number
}

export const useCategoriesMonthyExpense = (params?: Params) => {
  return useQuery({
    queryKey: [KEY, params],
    queryFn: () => api.get<Record<string, number>>(`${BFF_BASE_URL}/monthly-expenses-by-category`, { params }).then((res) => res.data),
    refetchOnWindowFocus: false
  })
}