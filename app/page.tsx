"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from "./app"

const queryClient = new QueryClient()

export default function Home() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  )
}