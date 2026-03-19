export interface Subcategory {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  name: string
  description: string
  color: string
}

export interface SubcategoryResponse {
  subcategories: Subcategory[]
}
