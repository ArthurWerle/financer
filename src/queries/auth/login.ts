import { BFF_BASE_URL } from '@/constants'
import { LoginCredentials, User } from '@/types/auth'
import api from '@/utils/api'

export const login = async (credentials: LoginCredentials) => {
  return await api.post<{ user: User }>(
    `${BFF_BASE_URL}/auth/login`,
    credentials
  )
}
