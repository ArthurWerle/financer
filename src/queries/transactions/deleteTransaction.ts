import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const deleteTransaction = async (id: number) => {
  return await api.delete(`${BFF_BASE_URL}/transactions/${id}`)
}
