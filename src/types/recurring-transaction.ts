export interface RecurringTransaction {
  id: number
  categoryId: number
  categoryName: string
  amount: number
  typeId: number
  typeName: 'income' | 'expense'
  description: string
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  startDate: string
  endDate: string
  lastOccurrence: string | null
  createdAt: string
  updatedAt: string
}
