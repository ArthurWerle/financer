import axios from "axios"

const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
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

    // Session is gone or invalid: send the user back to the login screen.
    // Login requests themselves are excluded so the form can show the error.
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
