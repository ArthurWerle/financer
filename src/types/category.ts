import { Average } from './common'

export interface Category {
  id: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  name: string
  description: string
  color: string
  // Left out of averages, reports and percentages (e.g. one-off purchases)
  exclude_from_calculations?: boolean
}

export interface CategoryResponse {
  categories: Category[]
}

export type CategoryAverage = {
  CategoryID: number
  CategoryName: string
} & Average
