import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './page'

const push = jest.fn()
const refresh = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
}))

describe('LoginPage', () => {
  beforeEach(() => {
    push.mockClear()
    refresh.mockClear()
  })

  it('renders the login form', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /sign in/i })
    ).toBeInTheDocument()
  })

  it('redirects to the dashboard after a successful login', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'arthur@example.com')
    await user.type(screen.getByLabelText(/password/i), 'correct-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => expect(push).toHaveBeenCalledWith('/'))
  })

  it('shows an error message when credentials are wrong', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    await user.type(screen.getByLabelText(/email/i), 'arthur@example.com')
    await user.type(screen.getByLabelText(/password/i), 'wrong-password')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /invalid email or password/i
    )
    expect(push).not.toHaveBeenCalled()
  })
})
