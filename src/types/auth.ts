export type User = {
  id: number
  name: string
  email: string
  enabled: boolean
  created_at?: string
  updated_at?: string
  last_login?: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type FeatureFlag = {
  id: number
  key: string
  description: string
  enabled: boolean
  created_at?: string
  updated_at?: string
}
