import { CATEGORY_SERVICE_BASE_URL } from "@/src/constants"
import { Type } from "@/src/types/type"
import api from "@/src/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useTypes = () => {
  return useQuery({
    queryKey: ['types'],
    queryFn: () => api.get<Type[]>(`${CATEGORY_SERVICE_BASE_URL}/type`).then((res) => res.data),
  })
}