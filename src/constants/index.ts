const baseURL = process.env.NODE_ENV === 'production' ? 'http://192.168.2.125' : 'http://localhost'

export const BFF_BASE_URL = `${baseURL}:8082/api/bff`
export const CATEGORY_SERVICE_BASE_URL = `${baseURL}:8080/api`
export const TRANSACTION_SERVICE_BASE_URL = `${baseURL}:8081/api`