import { canChangeRecurringAmount } from './can-change-recurring-amount'

describe('canChangeRecurringAmount', () => {
  const now = new Date(2026, 9, 7)
  const recurring = { is_recurring: true, is_prepaid: false }

  it('allows open-ended schedules', () => {
    expect(canChangeRecurringAmount(recurring, now)).toBe(true)
  })

  it('allows schedules ending this month or later', () => {
    expect(
      canChangeRecurringAmount({ ...recurring, end_date: '2026-10-01T00:00:00Z' }, now)
    ).toBe(true)
    expect(
      canChangeRecurringAmount({ ...recurring, end_date: '2027-01-31T00:00:00Z' }, now)
    ).toBe(true)
  })

  it('rejects schedules that already ended', () => {
    expect(
      canChangeRecurringAmount({ ...recurring, end_date: '2026-09-30T00:00:00Z' }, now)
    ).toBe(false)
  })

  it('rejects one-offs and prepaid schedules', () => {
    expect(canChangeRecurringAmount({ ...recurring, is_recurring: false }, now)).toBe(false)
    expect(canChangeRecurringAmount({ ...recurring, is_prepaid: true }, now)).toBe(false)
  })
})
