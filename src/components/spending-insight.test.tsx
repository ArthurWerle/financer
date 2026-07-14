import { render, screen, waitFor } from '../utils/test-utils'
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
