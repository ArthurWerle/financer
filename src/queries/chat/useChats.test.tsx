import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { rest } from 'msw'
import { server } from '@/tests/mocks/server'
import { useChats } from './useChats'
import { useChat } from './useChat'

const BFF = 'http://localhost:8082/api/bff'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
  return Wrapper
}

describe('useChats', () => {
  it('unwraps the chat list from the { success, data } envelope', async () => {
    server.use(
      rest.get(`${BFF}/ai/chats`, (_req, res, ctx) =>
        res(
          ctx.json({
            success: true,
            data: [
              {
                id: 'chat-1',
                userId: '1',
                title: 'Groceries',
                createdAt: '2026-07-13T10:00:00Z',
                updatedAt: '2026-07-13T10:00:00Z',
              },
            ],
          })
        )
      )
    )

    const { result } = renderHook(() => useChats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(1)
    expect(result.current.data?.[0].title).toBe('Groceries')
  })

  it('scopes the list to the logged-in user id', async () => {
    let requestedUserId: string | null = null
    server.use(
      rest.get(`${BFF}/ai/chats`, (req, res, ctx) => {
        requestedUserId = req.url.searchParams.get('userId')
        return res(ctx.json({ success: true, data: [] }))
      })
    )

    const { result } = renderHook(() => useChats(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    // useMe resolves to the default mock user (id 1), so the list refetches
    // scoped to that owner — matching the id stamped on chats at creation.
    await waitFor(() => expect(requestedUserId).toBe('1'))
  })
})

describe('useChat', () => {
  it('fetches a chat with its messages', async () => {
    server.use(
      rest.get(`${BFF}/ai/chats/chat-1`, (_req, res, ctx) =>
        res(
          ctx.json({
            success: true,
            data: {
              chat: { id: 'chat-1', title: 'Groceries' },
              messages: [
                {
                  id: 'm1',
                  chatId: 'chat-1',
                  role: 'user',
                  content: 'hi',
                  attachments: [],
                },
              ],
            },
          })
        )
      )
    )

    const { result } = renderHook(() => useChat('chat-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.chat.id).toBe('chat-1')
    expect(result.current.data?.messages).toHaveLength(1)
  })

  it('stays idle without a chat id', () => {
    const { result } = renderHook(() => useChat(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.fetchStatus).toBe('idle')
  })
})
