import { BFF_BASE_URL } from '@/constants'
import { Subcategory } from '@/types/subcategory'
import api from '@/utils/api'

type PostSubcategoryType = Partial<
  Omit<Subcategory, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
>

export const addSubcategory = async (subcategory: PostSubcategoryType) => {
  return await api.post(`${BFF_BASE_URL}/subcategories`, subcategory)
}
