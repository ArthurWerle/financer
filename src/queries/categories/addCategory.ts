import { BFF_BASE_URL } from "@/constants"
import { Category } from "@/types/category"
import api from "@/utils/api"


type PostCategoryType =
  Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>>

export const addCategory = async (category: PostCategoryType) => {
  return await api.post(`${BFF_BASE_URL}/category`, category)
}