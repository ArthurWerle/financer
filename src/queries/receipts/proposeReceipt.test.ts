import { rest } from 'msw'
import { server } from '@/tests/mocks/server'
import { proposeReceipt, refineReceipt } from './proposeReceipt'

const BFF = 'http://localhost:8082/api/bff'

describe('proposeReceipt', () => {
  it('posts dryRun:true and returns the proposed items', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      rest.post(`${BFF}/ai/scan`, async (req, res, ctx) => {
        body = await req.json()
        return res(
          ctx.json({
            success: true,
            dryRun: true,
            items: [
              {
                categoryId: 2,
                datetime: '2026-05-12T16:00:00.000Z',
                value: 10,
                description: 'Coffee',
              },
            ],
          })
        )
      })
    )

    const result = await proposeReceipt([
      { type: 'text', content: 'Please scan this receipt.' },
      { type: 'image', content: 'abc' },
    ])

    expect(body).toEqual({
      messages: [
        { type: 'text', content: 'Please scan this receipt.' },
        { type: 'image', content: 'abc' },
      ],
      dryRun: true,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.items).toHaveLength(1)
      expect(result.items[0].description).toBe('Coffee')
    }
  })

  it('passes a needsClarification response through', async () => {
    server.use(
      rest.post(`${BFF}/ai/scan`, (_req, res, ctx) =>
        res(
          ctx.json({
            success: true,
            needsClarification: true,
            question: 'Onde foi essa compra?',
            items: [],
          })
        )
      )
    )

    const result = await proposeReceipt([{ type: 'image', content: 'abc' }])
    expect(result).toEqual({
      success: true,
      needsClarification: true,
      question: 'Onde foi essa compra?',
      items: [],
    })
  })

  it('surfaces a 422 failure as a result instead of throwing', async () => {
    server.use(
      rest.post(`${BFF}/ai/scan`, (_req, res, ctx) =>
        res(
          ctx.status(422),
          ctx.json({ success: false, error: 'no transactions found' })
        )
      )
    )

    const result = await proposeReceipt([{ type: 'image', content: 'abc' }])
    expect(result).toEqual({ success: false, error: 'no transactions found' })
  })
})

describe('refineReceipt', () => {
  it('posts the correction text and previousItems with dryRun:true', async () => {
    let body: Record<string, unknown> | undefined
    server.use(
      rest.post(`${BFF}/ai/scan`, async (req, res, ctx) => {
        body = await req.json()
        return res(
          ctx.json({
            success: true,
            dryRun: true,
            items: [
              {
                categoryId: 5,
                datetime: '2026-05-12T16:00:00.000Z',
                value: 10,
                description: 'Coffee',
              },
            ],
          })
        )
      })
    )

    const previousItems = [
      {
        categoryId: 2,
        datetime: '2026-05-12T16:00:00.000Z',
        value: 10,
        description: 'Coffee',
      },
    ]
    const result = await refineReceipt(previousItems, 'muda a categoria para Lazer')

    expect(body).toEqual({
      messages: [{ type: 'text', content: 'muda a categoria para Lazer' }],
      dryRun: true,
      previousItems,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.items[0].categoryId).toBe(5)
    }
  })
})
