import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const deleteSubcategory = async (id: number) => {
  return await api.delete(`${BFF_BASE_URL}/subcategories/${id}`)
}
