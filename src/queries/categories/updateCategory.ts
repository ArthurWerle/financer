import { BFF_BASE_URL } from '@/constants'
import { Category } from '@/types/category'
import api from '@/utils/api'

export type UpdateCategoryData = Partial<
  Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>

export const updateCategory = async (
  id: number,
  data: UpdateCategoryData
) => {
  return await api.put(`${BFF_BASE_URL}/categories/${id}`, data)
}
