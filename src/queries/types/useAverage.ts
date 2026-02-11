import { BFF_BASE_URL } from '@/constants'
import { TypeAverage, Types } from '@/types/type'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const useAverage = () => {
  return useQuery({
    queryKey: ['types/average'],
    queryFn: () =>
      api
        .get<TypeAverage[]>(`${BFF_BASE_URL}/v1/types/average`)
        .then((res) => res.data),
    select: (data) => {
      const expense = data.find((average) => average.TypeName === Types.Expense)
      const income = data.find((average) => average.TypeName === Types.Income)

      return {
        expense,
        income,
      }
    },
  })
}
