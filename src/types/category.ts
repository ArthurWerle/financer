import { Average } from './common'

export interface Category {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  name: string
  description: string
  color: string
}

export interface CategoryResponse {
  categories: Category[]
}

export type CategoryAverage = {
  CategoryID: number
  CategoryName: string
} & Average
