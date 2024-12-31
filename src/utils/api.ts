import axios from "axios"

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost"
console.log('API Base URL:', baseURL)

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.request.use(config => {
  console.log('Request:', config.method?.toUpperCase(), config.url)
  return config
})

api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.config.url)
    return response
  },
  error => {
    console.error('Error:', error.response?.status, error.config?.url)
    return Promise.reject(error)
  }
)

export default api
