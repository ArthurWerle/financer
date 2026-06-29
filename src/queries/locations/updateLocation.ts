import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export type UpdateLocationData = {
  name?: string
}

export const updateLocation = async (id: number, data: UpdateLocationData) => {
  return await api.put(`${BFF_BASE_URL}/locations/${id}`, data)
}
