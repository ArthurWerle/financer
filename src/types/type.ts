import { Average } from './common'

export enum Types {
  Income = 'income',
  Expense = 'expense',
}

export type Type = {
  ID: number
  CreatedAt: string
  UpdatedAt: string
  DeletedAt: string | null
  Name: string
  Description: string
}

export type TypeAverage = {
  TypeID: number
  TypeName: Types
} & Average
