import { BFF_BASE_URL } from '@/constants'
import api from '@/utils/api'

export const logout = async () => {
  return await api.post(`${BFF_BASE_URL}/auth/logout`, {})
}
