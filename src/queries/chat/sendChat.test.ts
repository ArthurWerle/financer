import { rest } from 'msw'
import { server } from '@/tests/mocks/server'
import { scanReceipt, askQuestion, fileToBase64 } from './sendChat'

const BFF = 'http://localhost:8082/api/bff'

describe('sendChat', () => {
  it('scanReceipt returns a successful scan result', async () => {
    server.use(
      rest.post(`${BFF}/ai/scan`, (_req, res, ctx) =>
        res(
          ctx.json({
            success: true,
            summary: 'Added R$ 10',
            transactions: [{ description: 'Coffee', amount: 10 }],
          })
        )
      )
    )

    const result = await scanReceipt([{ type: 'text', content: 'hi' }])
    expect(result).toEqual({
      success: true,
      summary: 'Added R$ 10',
      transactions: [{ description: 'Coffee', amount: 10 }],
    })
  })

  it('scanReceipt surfaces a 422 failure as a result instead of throwing', async () => {
    server.use(
      rest.post(`${BFF}/ai/scan`, (_req, res, ctx) =>
        res(
          ctx.status(422),
          ctx.json({ success: false, error: 'no transactions found' })
        )
      )
    )

    const result = await scanReceipt([{ type: 'text', content: 'hi' }])
    expect(result).toEqual({ success: false, error: 'no transactions found' })
  })

  it('scanReceipt rethrows on a non-result error (500)', async () => {
    server.use(
      rest.post(`${BFF}/ai/scan`, (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: 'boom' }))
      )
    )

    await expect(
      scanReceipt([{ type: 'text', content: 'hi' }])
    ).rejects.toBeTruthy()
  })

  it('askQuestion posts the message parts and returns the answer payload', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      rest.post(`${BFF}/ai/ask`, async (req, res, ctx) => {
        body = await req.json()
        return res(ctx.json({ success: true, chatId: 'chat-1', answer: '42' }))
      })
    )

    const result = await askQuestion([
      { type: 'text', content: 'how much did I spend?' },
    ])

    expect(body).toEqual({
      messages: [{ type: 'text', content: 'how much did I spend?' }],
    })
    expect(result.answer).toBe('42')
    expect(result.chatId).toBe('chat-1')
  })

  it('askQuestion stamps the userId in the body when provided', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      rest.post(`${BFF}/ai/ask`, async (req, res, ctx) => {
        body = await req.json()
        return res(ctx.json({ success: true, chatId: 'chat-1', answer: 'ok' }))
      })
    )

    await askQuestion([{ type: 'text', content: 'hi' }], undefined, '1')

    expect(body).toEqual({
      messages: [{ type: 'text', content: 'hi' }],
      userId: '1',
    })
  })

  it('askQuestion forwards the chatId when continuing a conversation', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      rest.post(`${BFF}/ai/ask`, async (req, res, ctx) => {
        body = await req.json()
        return res(ctx.json({ success: true, chatId: 'chat-1', answer: 'ok' }))
      })
    )

    await askQuestion([{ type: 'text', content: 'and yesterday?' }], 'chat-1')

    expect(body).toMatchObject({ chatId: 'chat-1' })
  })

  it('askQuestion surfaces a 404 (deleted chat) as a failed result', async () => {
    server.use(
      rest.post(`${BFF}/ai/ask`, (_req, res, ctx) =>
        res(ctx.status(404), ctx.json({ success: false, error: 'Chat not found' }))
      )
    )

    const result = await askQuestion(
      [{ type: 'text', content: 'hi' }],
      'deleted-chat'
    )
    expect(result).toEqual({ success: false, error: 'Chat not found' })
  })

  it('fileToBase64 strips the data-url prefix', async () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
    const base64 = await fileToBase64(file)
    expect(base64).toBe(Buffer.from('hello').toString('base64'))
  })
})
