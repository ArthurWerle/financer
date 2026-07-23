import { fireEvent, render, screen, waitFor } from '../utils/test-utils'
import { SpendingInsight } from '@/components/spending-insight'
import { server } from '../tests/mocks/server'
import { rest } from 'msw'

const BFF_BASE_URL = 'http://localhost:8082/api/bff'

describe('SpendingInsight', () => {
  it('renders nothing while the insight is loading', () => {
    const { container } = render(<SpendingInsight />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the insight text after loading', async () => {
    render(<SpendingInsight />)

    await waitFor(() => {
      expect(screen.getByTestId('spending-insight')).toBeInTheDocument()
    })

    // The sentence is split into word spans for the staggered animation, so
    // assert on the container's full text content.
    expect(screen.getByTestId('spending-insight')).toHaveTextContent(
      'Good work! You reduced your grocery spending by 23% compared to last month!'
    )
  })

  it('renders nothing when the insight request fails', async () => {
    server.use(
      rest.get(`${BFF_BASE_URL}/ai/insights`, (req, res, ctx) =>
        res(ctx.status(502), ctx.json({ success: false, error: 'boom' }))
      )
    )

    const { container } = render(<SpendingInsight />)

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })

  it('shows the headline and reveals the detailed body on demand', async () => {
    server.use(
      rest.get(`${BFF_BASE_URL}/ai/insights`, (req, res, ctx) =>
        res(
          ctx.json({
            success: true,
            insight:
              'Spending is up 12% this month.\n\n- Groceries are R$ 420,00 above average.',
          })
        )
      )
    )

    render(<SpendingInsight />)

    const banner = await screen.findByTestId('spending-insight')
    expect(banner).toHaveTextContent('Spending is up 12% this month.')
    // The detailed body stays hidden until the user expands it.
    expect(banner).not.toHaveTextContent('Groceries are R$ 420,00 above average.')

    fireEvent.click(screen.getByRole('button', { name: /show details/i }))

    await waitFor(() =>
      expect(banner).toHaveTextContent('Groceries are R$ 420,00 above average.')
    )
  })

  it('renders nothing when the response has no insight', async () => {
    server.use(
      rest.get(`${BFF_BASE_URL}/ai/insights`, (req, res, ctx) =>
        res(ctx.json({ success: true, insight: '' }))
      )
    )

    const { container } = render(<SpendingInsight />)

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement()
    })
  })
})
