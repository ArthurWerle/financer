export interface Transaction {
  id: number
  created_by_id?: number
  is_prepaid: boolean
  is_recurring?: boolean
  category_id: number
  frequency?: string
  amount: number
  subtype?: string
  type: 'income' | 'expense'
  description: string
  date: string
  start_date?: string
  prepaid_from_id?: number
  end_date?: string
  total_paid?: number
  created_at: string
  updated_at: string
}

export interface TransactionResponse {
  count: number
  transactions: Transaction[]
}
