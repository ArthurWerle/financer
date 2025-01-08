import { CATEGORY_SERVICE_BASE_URL } from "@/src/constants"
import { Category } from "@/src/types/category"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const KEY = '/categories'

export const useCategories = () => {
  return useQuery({
    queryKey: [KEY],
    queryFn: () => api.get<Category[]>(`${CATEGORY_SERVICE_BASE_URL}/category`).then((res) => res.data),
    refetchOnWindowFocus: false
  })
}