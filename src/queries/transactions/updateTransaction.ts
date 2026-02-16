import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export type UpdateTransactionData = {
  is_recurring?: boolean
  category_id?: number
  amount?: number
  type?: string
  subtype?: string
  description?: string
  date?: string
  frequency?: string
  start_date?: string
  end_date?: string
}

export const updateTransaction = async (
  id: number,
  data: UpdateTransactionData
) => {
  return await api.put(`${BFF_BASE_URL}/transactions/${id}`, data)
}
