import { limitToRange } from './historical-data'

const months = Array.from({ length: 20 }, (_, i) => ({ month: `m${i}` }))

describe('limitToRange', () => {
  it('keeps only the last 12 months', () => {
    const result = limitToRange(months, 'last-12')
    expect(result).toHaveLength(12)
    expect(result?.[0].month).toBe('m8')
    expect(result?.[11].month).toBe('m19')
  })

  it('returns everything for all time', () => {
    expect(limitToRange(months, 'all')).toHaveLength(20)
  })

  it('handles undefined data', () => {
    expect(limitToRange(undefined, 'last-12')).toBeUndefined()
  })
})
