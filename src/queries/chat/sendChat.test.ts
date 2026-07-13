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

  it('askQuestion returns the answer payload', async () => {
    server.use(
      rest.post(`${BFF}/ai/ask`, (_req, res, ctx) =>
        res(ctx.json({ success: true, data: { answer: '42' } }))
      )
    )

    const result = await askQuestion('how much did I spend?')
    expect(result.data?.answer).toBe('42')
  })

  it('fileToBase64 strips the data-url prefix', async () => {
    const file = new File(['hello'], 'note.txt', { type: 'text/plain' })
    const base64 = await fileToBase64(file)
    expect(base64).toBe(Buffer.from('hello').toString('base64'))
  })
})
