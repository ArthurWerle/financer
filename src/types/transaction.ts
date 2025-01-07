export interface Transaction {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  typeId: number
  typeName: 'income' | 'expense'
  date: string
  description: string
  createdAt: string
  updatedAt: string
}