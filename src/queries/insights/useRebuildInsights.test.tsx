import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRebuildInsights } from './useRebuildInsights'
import { KEY } from './useSpendingInsight'
import { server } from '../../tests/mocks/server'
import { rest } from 'msw'

const BFF_BASE_URL = 'http://localhost:8082/api/bff'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return { Wrapper, queryClient }
}

describe('useRebuildInsights', () => {
  it('regenerates the insight and primes the cached query', async () => {
    let requestedUrl = ''
    server.use(
      rest.get(`${BFF_BASE_URL}/ai/insights`, (req, res, ctx) => {
        requestedUrl = req.url.toString()
        return res(
          ctx.json({
            success: true,
            insight: 'Rebuilt insight.',
            cached: false,
          })
        )
      })
    )

    const { Wrapper, queryClient } = createWrapper()
    const { result } = renderHook(() => useRebuildInsights(), {
      wrapper: Wrapper,
    })

    result.current.mutate()

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(requestedUrl).toContain('refresh=true')
    expect(result.current.data?.insight).toBe('Rebuilt insight.')
    expect(queryClient.getQueryData([KEY])).toEqual({
      success: true,
      insight: 'Rebuilt insight.',
      cached: false,
    })
  })
})
