import { BFF_BASE_URL } from "@/constants"
import { Type } from "@/types/type"
import api from "@/utils/api"
import { useQuery } from "@tanstack/react-query"

export const useTypes = () => {
  return useQuery({
    queryKey: ['types'],
    queryFn: () => api.get<Type[]>(`${BFF_BASE_URL}/types`).then((res) => res.data),
  })
}