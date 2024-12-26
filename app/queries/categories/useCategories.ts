import { CATEGORY_SERVICE_BASE_URL } from "@/app/constants"
import { Category } from "@/app/types/category"
import api from "@/app/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => api.get<Category[]>(`${CATEGORY_SERVICE_BASE_URL}/category`).then((res) => res.data),
  })
}