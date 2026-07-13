import { rest } from 'msw'
import { server } from '@/tests/mocks/server'
import { renameChat, deleteChat } from './chatActions'

const BFF = 'http://localhost:8082/api/bff'

describe('chatActions', () => {
  it('renameChat patches the title and returns the updated chat', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      rest.patch(`${BFF}/ai/chats/chat-1`, async (req, res, ctx) => {
        body = await req.json()
        return res(
          ctx.json({
            success: true,
            data: { id: 'chat-1', title: 'Groceries budget' },
          })
        )
      })
    )

    const chat = await renameChat('chat-1', 'Groceries budget')

    expect(body).toEqual({ title: 'Groceries budget' })
    expect(chat.title).toBe('Groceries budget')
  })

  it('renameChat throws on a 404', async () => {
    server.use(
      rest.patch(`${BFF}/ai/chats/gone`, (_req, res, ctx) =>
        res(ctx.status(404), ctx.json({ success: false, error: 'Chat not found' }))
      )
    )

    await expect(renameChat('gone', 'title')).rejects.toBeTruthy()
  })

  it('deleteChat resolves on success', async () => {
    server.use(
      rest.delete(`${BFF}/ai/chats/chat-1`, (_req, res, ctx) =>
        res(ctx.json({ success: true, data: { deleted: true } }))
      )
    )

    await expect(deleteChat('chat-1')).resolves.toBeUndefined()
  })

  it('deleteChat throws on a 404', async () => {
    server.use(
      rest.delete(`${BFF}/ai/chats/gone`, (_req, res, ctx) =>
        res(ctx.status(404), ctx.json({ success: false, error: 'Chat not found' }))
      )
    )

    await expect(deleteChat('gone')).rejects.toBeTruthy()
  })
})
