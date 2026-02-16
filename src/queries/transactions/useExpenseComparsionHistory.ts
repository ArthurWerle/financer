import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/expense-comparsion-history'

type ExpenseComparsionHistoryResponse = {
  month: string
  income: number
  expense: number
}

export const useIncomeAndExpenseComparsionHistory = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<
          ExpenseComparsionHistoryResponse[]
        >(`${BFF_BASE_URL}/expense-comparsion-history`)
        .then((res) => res.data),
    refetchOnWindowFocus: false,
    select: (data) => {
      console.log('expense comparsion data', data)
      const reversed = data.reverse()
      console.log('expense comparsion data REVERSED', reversed)
      return reversed
    },
  })
}
