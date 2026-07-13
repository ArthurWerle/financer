import axios from "axios"
import { BFF_BASE_URL } from "@/constants"

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

// A dead session leaves the HttpOnly session_id cookie in place, which the
// middleware still treats as "logged in" and keeps bouncing /login -> /. That
// ping-pong is the infinite-refresh loop. This guard makes sure a burst of
// concurrent 401s only triggers a single cleanup + redirect.
let isHandlingSessionExpiry = false

api.interceptors.response.use(
  response => {
    console.log('Response:', response.status, response.config.url)
    return response
  },
  async error => {
    console.error('Error:', error.response?.status, error.config?.url)

    // Auth requests are excluded so the login form can show its error and so
    // the logout call below does not recurse into this handler.
    const url = error.config?.url ?? ''
    const isAuthRequest =
      url.includes('/auth/login') || url.includes('/auth/logout')

    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login' &&
      !isHandlingSessionExpiry
    ) {
      isHandlingSessionExpiry = true

      // The session_id cookie is HttpOnly, so JS cannot delete it directly.
      // Hitting the BFF logout endpoint clears it (via Set-Cookie) so the
      // middleware stops seeing a "logged in" user and the redirect loop ends.
      // Use a bare axios call to avoid re-entering this interceptor. We redirect
      // regardless of the outcome.
      try {
        await axios.post(
          `${BFF_BASE_URL}/auth/logout`,
          {},
          { withCredentials: true }
        )
      } catch {
        // ignore - we are leaving the page anyway
      }

      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
