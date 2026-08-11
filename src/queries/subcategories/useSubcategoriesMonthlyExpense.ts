import { BFF_BASE_URL } from "@/constants"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/subcategories-monthly-expense'

type Params = {
  month?: number
  year?: number
}

export const useSubcategoriesMonthyExpense = (params?: Params) => {
  return useQuery({
    queryKey: [KEY, params?.month, params?.year],
    queryFn: ({ queryKey }) => {
      const [, month, year] = queryKey
      return api.get<Record<string, number>>(`${BFF_BASE_URL}/monthly-expenses-by-subcategory`, { params: { month, year } }).then((res) => res.data)
    },
    refetchOnWindowFocus: false
  })
}
