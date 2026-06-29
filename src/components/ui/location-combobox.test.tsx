import { useState } from 'react'
import { render, screen, waitFor } from '../../utils/test-utils'
import userEvent from '@testing-library/user-event'
import { LocationCombobox } from './location-combobox'

function Harness() {
  const [value, setValue] = useState('')
  return (
    <div>
      <LocationCombobox id="location" value={value} onChange={setValue} />
      <span data-testid="value">{value}</span>
    </div>
  )
}

describe('LocationCombobox', () => {
  it('suggests previously-used places matching the typed text', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Merc')

    await waitFor(() => {
      expect(screen.getByText('Mercado X')).toBeInTheDocument()
    })
    // Non-matching suggestion is filtered out.
    expect(screen.queryByText('Lancheria Y')).not.toBeInTheDocument()
  })

  it('reuses an existing place when a suggestion is clicked', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'merc')

    const suggestion = await screen.findByText('Mercado X')
    await user.click(suggestion)

    expect(screen.getByTestId('value')).toHaveTextContent('Mercado X')
  })

  it('allows a brand new place to be typed freely', async () => {
    const user = userEvent.setup()
    render(<Harness />)

    const input = screen.getByRole('textbox')
    await user.type(input, 'Doceria Z')

    expect(screen.getByTestId('value')).toHaveTextContent('Doceria Z')
  })
})
