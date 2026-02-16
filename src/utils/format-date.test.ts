import { humanReadableDate } from '@/utils/format-date'

describe('humanReadableDate', () => {
  it('should format date in human readable format', () => {
    const date = '2026-02-15T21:32:18.403Z'
    const result = humanReadableDate(date)
    expect(result).toBe('Sunday, February 15, 2026')
  })
})
