import { BFF_BASE_URL } from '@/constants'
import { Subcategory } from '@/types/subcategory'
import api from '@/utils/api'

export type UpdateSubcategoryData = Partial<
  Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>

export const updateSubcategory = async (
  id: number,
  data: UpdateSubcategoryData
) => {
  return await api.put(`${BFF_BASE_URL}/subcategories/${id}`, data)
}
