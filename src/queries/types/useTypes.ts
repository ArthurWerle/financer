import { CATEGORY_SERVICE_BASE_URL } from "@/constants"
import { Type } from "@/types/type"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useTypes = () => {
  return useQuery({
    queryKey: ['types'],
    queryFn: () => api.get<Type[]>(`${CATEGORY_SERVICE_BASE_URL}/type`).then((res) => res.data),
  })
}