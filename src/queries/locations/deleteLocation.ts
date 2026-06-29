import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const deleteLocation = async (id: number) => {
  return await api.delete(`${BFF_BASE_URL}/locations/${id}`)
}
