import { CATEGORY_SERVICE_BASE_URL } from "@/constants"
import { Category } from "@/types/category"
import api from "@/utils/api"


type PostCategoryType = 
  Partial<Omit<Category, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>>

export const addCategory = async (category: PostCategoryType) => {
  return await api.post(`${CATEGORY_SERVICE_BASE_URL}/category`, category)
}