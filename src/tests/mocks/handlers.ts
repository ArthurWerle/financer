import { rest } from 'msw'

const BFF_BASE_URL = 'http://localhost:8082/api/bff'

const emptyTransactionResponse = {
  count: 0,
  sum: 0,
  total: 0,
  limit: 0,
  offset: 0,
  transactions: [],
}

export const mockUser = {
  id: 1,
  name: 'Arthur Werle',
  email: 'arthur@example.com',
  enabled: true,
}

export const handlers = [
  // Mock login endpoint
  rest.post(`${BFF_BASE_URL}/auth/login`, async (req, res, ctx) => {
    const { email, password } = await req.json()

    if (email === mockUser.email && password === 'correct-password') {
      return res(ctx.json({ user: mockUser }))
    }

    return res(
      ctx.status(401),
      ctx.json({ error: 'login_failed', message: 'invalid email or password' })
    )
  }),

  // Mock logout endpoint
  rest.post(`${BFF_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(ctx.json({ message: 'Logged out successfully' }))
  }),

  // Mock current user endpoint
  rest.get(`${BFF_BASE_URL}/auth/me`, (req, res, ctx) => {
    return res(ctx.json(mockUser))
  }),

  // Mock feature flag check endpoint
  rest.get(`${BFF_BASE_URL}/feature-flags/check`, (req, res, ctx) => {
    const key = req.url.searchParams.get('key')
    return res(ctx.json({ enabled: key === 'enabled-flag' }))
  }),

  // Mock month overview endpoint
  rest.get(`${BFF_BASE_URL}/overview/by-month`, (req, res, ctx) => {
    return res(
      ctx.json({
        income: {
          currentMonth: 5000.0,
          lastMonth: 4500.0,
          percentageVariation: 11.11,
        },
        expense: {
          currentMonth: 1500.75,
          lastMonth: 1800.5,
          percentageVariation: -16.67,
        },
      })
    )
  }),

  // Mock average by type endpoint
  rest.get(`${BFF_BASE_URL}/types/average`, (req, res, ctx) => {
    return res(
      ctx.json({
        averageByType: [
          { type_name: 'income', average: 4500 },
          { type_name: 'expense', average: 1800 },
        ],
      })
    )
  }),

  // Mock income and expense comparison history endpoint
  rest.get(`${BFF_BASE_URL}/expense-comparsion-history`, (req, res, ctx) => {
    return res(
      ctx.json([
        { month: 'Jan', income: 5000, expense: 1200 },
        { month: 'Feb', income: 5000, expense: 1500 },
        { month: 'Mar', income: 5000, expense: 1300 },
      ])
    )
  }),

  // Mock monthly expenses by category endpoint
  rest.get(
    `${BFF_BASE_URL}/monthly-expenses-by-category`,
    (req, res, ctx) => {
      return res(
        ctx.json({
          Food: 800.5,
          Transportation: 700.25,
        })
      )
    }
  ),

  // Mock latest transactions endpoint
  rest.get(`${BFF_BASE_URL}/transactions/latest`, (req, res, ctx) => {
    return res(ctx.json(emptyTransactionResponse))
  }),

  // Mock biggest transactions endpoint
  rest.get(`${BFF_BASE_URL}/transactions/biggest`, (req, res, ctx) => {
    return res(ctx.json(emptyTransactionResponse))
  }),

  // Mock locations endpoint
  rest.get(`${BFF_BASE_URL}/locations`, (req, res, ctx) => {
    return res(
      ctx.json({
        count: 2,
        locations: [
          {
            id: 1,
            name: 'Mercado X',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
          {
            id: 2,
            name: 'Lancheria Y',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
          },
        ],
      })
    )
  }),

  // Mock categories endpoint
  rest.get(`${BFF_BASE_URL}/categories`, (req, res, ctx) => {
    return res(
      ctx.json({
        categories: [
          { id: 1, name: 'Food' },
          { id: 2, name: 'Income' },
          { id: 3, name: 'Transportation' },
        ],
      })
    )
  }),
]
