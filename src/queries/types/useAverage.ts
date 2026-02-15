import { BFF_BASE_URL } from '@/constants'
import { TypeAverage, TypeAverageResponse, Types } from '@/types/type'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const useAverage = () => {
  return useQuery({
    queryKey: ['types/average'],
    queryFn: () =>
      api
        .get<TypeAverage[] | TypeAverageResponse>(`${BFF_BASE_URL}/types/average`)
        .then((res) => res.data),
    select: (data) => {
      // this is from v1
      if (Array.isArray(data)) {
        return {
          expense: data.find((average) => average.TypeName === Types.Expense),
          income: data.find((average) => average.TypeName === Types.Income),
        }
      }

      const expense = data.averageByType.find((average) => average.TypeName === Types.Expense)
      const income = data.averageByType.find((average) => average.TypeName === Types.Income)

      return {
        expense,
        income,
      }
    },
  })
}
