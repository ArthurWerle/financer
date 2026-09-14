import { toRFC3339 } from './to-rfc3339'

describe('toRFC3339', () => {
  it('appends the Sao Paulo offset to a naive datetime', () => {
    expect(toRFC3339('2026-09-12T15:21:26')).toBe('2026-09-12T15:21:26-03:00')
  })

  it('pads missing seconds', () => {
    expect(toRFC3339('2026-09-12T15:21')).toBe('2026-09-12T15:21:00-03:00')
  })

  it('accepts a space separator', () => {
    expect(toRFC3339('2026-09-12 15:21:26')).toBe('2026-09-12T15:21:26-03:00')
  })

  it('uses the offset in effect at the time, not a fixed one', () => {
    // Brazil was on DST (UTC-02:00) in January 2018.
    expect(toRFC3339('2018-01-15T10:30:00')).toBe('2018-01-15T10:30:00-02:00')
  })

  it('leaves an already UTC value untouched', () => {
    expect(toRFC3339('2026-05-12T16:00:00.000Z')).toBe(
      '2026-05-12T16:00:00.000Z'
    )
  })

  it('leaves an already offset value untouched', () => {
    expect(toRFC3339('2026-09-12T15:21:26-03:00')).toBe(
      '2026-09-12T15:21:26-03:00'
    )
  })

  it('is idempotent', () => {
    const once = toRFC3339('2026-09-12T15:21:26')
    expect(toRFC3339(once)).toBe(once)
  })

  it('returns undefined for a missing or empty value', () => {
    expect(toRFC3339(undefined)).toBeUndefined()
    expect(toRFC3339(null)).toBeUndefined()
    expect(toRFC3339('   ')).toBeUndefined()
  })

  it('passes through an unrecognized value instead of mangling it', () => {
    expect(toRFC3339('not a date')).toBe('not a date')
  })
})
