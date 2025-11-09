import { Average } from './common'

export interface Category {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  Name: string
  Description: string
  Color: string
}

export type CategoryAverage = {
  CategoryID: number
  CategoryName: string
} & Average
