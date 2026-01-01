const baseURL =
  process.env.NODE_ENV === 'production'
    ? `http://${process.env.NEXT_PUBLIC_SERVER_BASE_URL}`
    : 'http://localhost'

export const BFF_BASE_URL = `${baseURL}:8082/api/bff` as const
export const CATEGORY_SERVICE_BASE_URL = `${baseURL}:8085/api` as const
export const TRANSACTION_SERVICE_BASE_URL = `${baseURL}:8081/api` as const
export const TRANSACTION_V2_SERVICE_BASE_URL = `${baseURL}:1235/api` as const
export const ANALYTICS_SERVICE_BASE_URL = `${baseURL}:1234/api/v1` as const
