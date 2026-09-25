import { render, screen, waitFor } from '../utils/test-utils'
import { Statistics } from '@/components/statistics'
import { server } from '../tests/mocks/server'
import { rest } from 'msw'

const BFF_BASE_URL = 'http://localhost:8082/api/bff'

describe('Statistics', () => {
  it('should render loading state initially', () => {
    render(<Statistics />)
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getAllByTestId('skeleton')).toHaveLength(4)
  })

  it('should render financial data after loading', async () => {
    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText(/R\$ 5\.000,00/)).toBeInTheDocument()
      expect(screen.getByText(/R\$ 1\.500,75/)).toBeInTheDocument()
      expect(screen.getByText(/11% from 6-month average/)).toBeInTheDocument()
      expect(screen.getByText(/17% from 6-month average/)).toBeInTheDocument()
      expect(screen.getByText(/27% of expenses/)).toBeInTheDocument()
    })
  })

  it('should leave categories excluded from calculations out of the recurring total', async () => {
    server.use(
      rest.get(`${BFF_BASE_URL}/categories`, (req, res, ctx) => {
        return res(
          ctx.json({
            categories: [
              { id: 1, name: 'Food' },
              { id: 2, name: 'Compras Avulsas', exclude_from_calculations: true },
              { id: 3, name: 'Transportation' },
            ],
          })
        )
      })
    )

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText(/R\$ 300,00/)).toBeInTheDocument()
      expect(screen.getByText(/20% of expenses/)).toBeInTheDocument()
    })
  })

  it('should show the full amounts when categories are excluded from calculations', async () => {
    server.use(
      rest.get(`${BFF_BASE_URL}/overview/by-month`, (req, res, ctx) => {
        return res(
          ctx.json({
            income: {
              currentMonth: 5000.0,
              lastMonth: 4500.0,
              percentageVariation: 11.11,
              fullCurrentMonth: 5000.0,
            },
            expense: {
              currentMonth: 1500.75,
              lastMonth: 1800.5,
              percentageVariation: -16.67,
              fullCurrentMonth: 3500.75,
            },
          })
        )
      })
    )

    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText(/R\$ 1\.500,75/)).toBeInTheDocument()
      expect(
        screen.getByText(/R\$ 3\.500,75 incl\. excluded categories/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/R\$ 1\.499,25 incl\. excluded categories/)
      ).toBeInTheDocument()
    })
    // Income is unaffected, so it gets no extra line.
    expect(screen.getAllByText(/incl\. excluded categories/)).toHaveLength(2)
  })

  it('should render historical data chart', async () => {
    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('Income vs expenses')).toBeInTheDocument()
    })
  })

  it('should render expense categories', async () => {
    render(<Statistics />)

    await waitFor(() => {
      expect(screen.getByText('Expenses by category')).toBeInTheDocument()
    })
  })

  it('should render an error message when the overview request fails', async () => {
    server.use(
      rest.get(`${BFF_BASE_URL}/overview/by-month`, (req, res, ctx) => {
        return res(ctx.status(500))
      })
    )

    render(<Statistics />)

    await waitFor(() => {
      expect(
        screen.getByText('Error loading financial data')
      ).toBeInTheDocument()
    })
  })
})
