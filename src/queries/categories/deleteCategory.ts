import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const deleteCategory = async (id: number) => {
  return await api.delete(`${BFF_BASE_URL}/categories/${id}`)
}
