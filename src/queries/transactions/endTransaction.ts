import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const endTransaction = async (id: number, end_date: string) => {
  return await api.patch(`${BFF_BASE_URL}/transactions/${id}/end`, { end_date })
}
