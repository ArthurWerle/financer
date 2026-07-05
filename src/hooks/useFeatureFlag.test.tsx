import { ReactNode } from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useFeatureFlag } from './useFeatureFlag'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return Wrapper
}

describe('useFeatureFlag', () => {
  it('returns true for a flag enabled for the user', async () => {
    const { result } = renderHook(() => useFeatureFlag('enabled-flag'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.enabled).toBe(true)
  })

  it('returns false for a disabled flag', async () => {
    const { result } = renderHook(() => useFeatureFlag('other-flag'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.enabled).toBe(false)
  })
})
