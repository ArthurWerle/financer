const baseURL = process.env.NODE_ENV === 'production' ? 'http://192.168.2.125' : 'http://localhost'

export const BFF_BASE_URL = `${baseURL}:8082/api/bff` as const
export const CATEGORY_SERVICE_BASE_URL = `${baseURL}:8080/api` as const
export const TRANSACTION_SERVICE_BASE_URL = `${baseURL}:8081/api` as const