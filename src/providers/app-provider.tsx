'use client'
 
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { KeyboardNavigationProvider } from './keyboard-nav-provider'
import { ToastContainer, toast } from 'react-toastify'
import ChatWidget from '@/components/chat/chat-widget'

interface ProvidersProps {
  children: ReactNode
}

// Never retry a 401 - the session is dead and retrying just adds noise before
// the api interceptor clears the cookie and redirects to /login.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (isAxiosError(error) && error.response?.status === 401) {
          return false
        }
        return failureCount < 3
      },
    },
  },
})

export default function AppProvider({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardNavigationProvider>
        {children}
      </KeyboardNavigationProvider>
      <ChatWidget />
      <ToastContainer
        theme="colored"
        toastClassName="!rounded-[9px] !border !border-border !bg-card !text-foreground !shadow-none !font-sans !text-[13px] !min-h-0 !p-3"
        progressClassName="!bg-faint"
      />
    </QueryClientProvider>
  )
}