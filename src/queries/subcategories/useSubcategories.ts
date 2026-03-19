import { BFF_BASE_URL } from '@/constants'
import { SubcategoryResponse } from '@/types/subcategory'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'

export const KEY = '/subcategories'

export const useSubcategories = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<SubcategoryResponse>(`${BFF_BASE_URL}/subcategories`)
        .then((res) => res.data),
    refetchOnWindowFocus: false,
    select: (data) => data.subcategories,
  })
}
