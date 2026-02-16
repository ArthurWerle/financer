import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const prepayTransaction = async (id: number) => {
  return await api.post(`${BFF_BASE_URL}/transactions/${id}/prepay`)
}
