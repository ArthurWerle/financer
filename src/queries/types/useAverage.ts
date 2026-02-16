import { BFF_BASE_URL } from '@/constants'
import { TypeAverageResponse, Types } from '@/types/type'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const useAverage = () => {
  return useQuery({
    queryKey: ['types/average'],
    queryFn: () =>
      api
        .get<TypeAverageResponse>(`${BFF_BASE_URL}/types/average`)
        .then((res) => res.data),
    select: (data) => {
      const expense = data.averageByType.find(
        (average) => average.TypeName === Types.Expense
      )
      const income = data.averageByType.find(
        (average) => average.TypeName === Types.Income
      )

      return {
        expense,
        income,
      }
    },
  })
}
