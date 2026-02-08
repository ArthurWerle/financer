const baseURL =
  process.env.NODE_ENV === 'production'
    ? `http://${process.env.NEXT_PUBLIC_SERVER_BASE_URL}`
    : 'http://localhost'

const BFF_PORT = process.env.NEXT_PUBLIC_BFF_PORT || '8082'
const CATEGORY_SERVICE_PORT = process.env.NEXT_PUBLIC_CATEGORY_SERVICE_PORT || '8085'
const TRANSACTION_SERVICE_PORT = process.env.NEXT_PUBLIC_TRANSACTION_SERVICE_PORT || '8081'
const TRANSACTION_V2_SERVICE_PORT = process.env.NEXT_PUBLIC_TRANSACTION_V2_SERVICE_PORT || '1235'
const ANALYTICS_SERVICE_PORT = process.env.NEXT_PUBLIC_ANALYTICS_SERVICE_PORT || '1234'

export const BFF_BASE_URL = `${baseURL}:${BFF_PORT}/api/bff` as const
export const CATEGORY_SERVICE_BASE_URL = `${baseURL}:${CATEGORY_SERVICE_PORT}/api` as const
export const TRANSACTION_SERVICE_BASE_URL = `${baseURL}:${TRANSACTION_SERVICE_PORT}/api` as const
export const TRANSACTION_V2_SERVICE_BASE_URL = `${baseURL}:${TRANSACTION_V2_SERVICE_PORT}/api` as const
export const ANALYTICS_SERVICE_BASE_URL = `${baseURL}:${ANALYTICS_SERVICE_PORT}/api/v1` as const
