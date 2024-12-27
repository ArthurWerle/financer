import { BFF_BASE_URL } from "@/src/constants"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

type ExpenseComparsionHistoryResponse = {
  month: string
  currentYear: number
  lastYear: number
}

export const useExpenseComparsionHistory = () => {
  return useQuery({
    queryKey: ['/expense-comparsion-history'],
    queryFn: () => api.get<ExpenseComparsionHistoryResponse[]>(`${BFF_BASE_URL}/expense-comparsion-history`).then((res) => res.data),
  })
}