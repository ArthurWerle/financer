'use client'
 
import { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { KeyboardNavigationProvider } from './keyboard-nav-provider'
import { ToastContainer, toast } from 'react-toastify'

interface ProvidersProps {
  children: ReactNode
}

const queryClient = new QueryClient()

export default function AppProvider({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <KeyboardNavigationProvider>
        {children}
      </KeyboardNavigationProvider>
      <ToastContainer />
    </QueryClientProvider>
  )
}