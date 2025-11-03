import { render, screen, waitFor } from '../utils/test-utils'
import { Statistics } from '@/components/statistics'
import { server } from '../mocks/server'
import { rest } from 'msw'

describe('Statistics', () => {
  it('should render loading state initially', () => {
    render(<Statistics />)
    expect(screen.getByText('Financial Overview')).toBeInTheDocument()
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6)
  })

  it('should render financial data after loading', async () => {
    server.use(
      rest.get('/api/bff/overview/by-month', (req, res, ctx) => {
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
      rest.get('/api/bff/monthly-expenses-by-category', (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.get('/api/combined-transactions/latest/3', (req, res, ctx) => {
        return res(ctx.json([]))
      }),
      rest.get('/api/combined-transactions/biggest/3', (req, res, ctx) => {
        return res(ctx.json([]))
      }),
      rest.get('/api/bff/expense-comparsion-history', (req, res, ctx) => {
        return res(ctx.json([]))
      })
    )

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText(/R\$ 5\.000,00/)).toBeInTheDocument()
      expect(screen.getByText(/R\$ 1\.500,75/)).toBeInTheDocument()
      expect(screen.getByText(/11% from last month/)).toBeInTheDocument()
      expect(screen.getByText(/17% from last month/)).toBeInTheDocument()
    })
  })

  it('should render expense comparison history', async () => {
    server.use(
      rest.get('/api/bff/overview/by-month', (req, res, ctx) => {
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
      rest.get('/api/bff/monthly-expenses-by-category', (req, res, ctx) => {
        return res(ctx.json({}))
      }),
      rest.get('/api/combined-transactions/latest/3', (req, res, ctx) => {
        return res(ctx.json([]))
      }),
      rest.get('/api/combined-transactions/biggest/3', (req, res, ctx) => {
        return res(ctx.json([]))
      }),
      rest.get('/api/bff/expense-comparsion-history', (req, res, ctx) => {
        return res(
          ctx.json([
            { month: 'Jan', currentYear: 1200, lastYear: 1000 },
            { month: 'Feb', currentYear: 1500, lastYear: 1300 },
            { month: 'Mar', currentYear: 1300, lastYear: 1200 },
          ])
        )
      })
    )

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('Expense Comparison')).toBeInTheDocument()
    })
  })

  it('should render expense categories', async () => {
    server.use(
      rest.get('/api/bff/overview/by-month', (req, res, ctx) => {
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
      rest.get('/api/bff/monthly-expenses-by-category', (req, res, ctx) => {
        return res(
          ctx.json({
            Food: 800.5,
            Transportation: 700.25,
          })
        )
      }),
      rest.get('/api/combined-transactions/latest/3', (req, res, ctx) => {
        return res(ctx.json([]))
      }),
      rest.get('/api/combined-transactions/biggest/3', (req, res, ctx) => {
        return res(ctx.json([]))
      }),
      rest.get('/api/bff/expense-comparsion-history', (req, res, ctx) => {
        return res(ctx.json([]))
      })
    )

    render(<Statistics />)

    await waitFor(() => {
      expect(
        screen.getByText('Monthly expenses by category')
      ).toBeInTheDocument()
    })
  })
})
