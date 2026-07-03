import { addDate } from './add-date'

describe('addDate', () => {
  it('adds months to a mid-month date', () => {
    const result = addDate(new Date(2026, 0, 15), 3)
    expect(result.getFullYear()).toBe(2026)
    expect(result.getMonth()).toBe(3) // April
    expect(result.getDate()).toBe(15)
  })

  it('clamps to the last day of shorter target months instead of overflowing', () => {
    // Jan 31 + 1 month must be Feb 28, not Mar 3
    const result = addDate(new Date(2026, 0, 31), 1)
    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(28)
  })

  it('handles leap years', () => {
    const result = addDate(new Date(2028, 0, 31), 1)
    expect(result.getMonth()).toBe(1) // February
    expect(result.getDate()).toBe(29)
  })

  it('crosses year boundaries', () => {
    const result = addDate(new Date(2026, 10, 10), 4)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(2) // March
    expect(result.getDate()).toBe(10)
  })

  it('supports 12 monthly installments ending 11 months after the first', () => {
    // The first installment is the starting month itself, so N installments
    // end N-1 months later.
    const installments = 12
    const result = addDate(new Date(2026, 6, 3), installments - 1)
    expect(result.getFullYear()).toBe(2027)
    expect(result.getMonth()).toBe(5) // June 2027 = 12th month counting July 2026
  })
})
