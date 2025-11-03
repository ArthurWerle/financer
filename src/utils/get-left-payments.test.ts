import { getLeftPayments } from '@/utils/get-left-payments'

describe('getLeftPayments', () => {
  beforeEach(() => {
    // Set a fixed date for testing: March 15, 2024
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2024-03-15'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('when endDate is undefined', () => {
    it('should return "No end date"', () => {
      expect(getLeftPayments(undefined, 'monthly')).toBe('No end date')
    })
  })

  describe('when endDate is in the past', () => {
    it('should return "0 payments left" for daily', () => {
      expect(getLeftPayments('2024-03-10', 'daily')).toBe('0 payments left')
    })

    it('should return "0 payments left" for weekly', () => {
      expect(getLeftPayments('2024-03-01', 'weekly')).toBe('0 payments left')
    })

    it('should return "0 payments left" for monthly', () => {
      expect(getLeftPayments('2024-02-15', 'monthly')).toBe('0 payments left')
    })

    it('should return "0 payments left" for yearly', () => {
      expect(getLeftPayments('2023-03-15', 'yearly')).toBe('0 payments left')
    })
  })

  describe('daily frequency', () => {
    it('should calculate days correctly for same month', () => {
      expect(getLeftPayments('2024-03-20', 'daily')).toBe('5 payments left')
    })

    it('should calculate days correctly across months', () => {
      // From Mar 15 to Apr 15 = 31 days
      expect(getLeftPayments('2024-04-15', 'daily')).toBe('31 payments left')
    })

    it('should calculate days correctly across years', () => {
      // From Mar 15, 2024 to Mar 15, 2025 = 366 days (2024 is leap year)
      expect(getLeftPayments('2025-03-15', 'daily')).toBe('366 payments left')
    })
  })

  describe('weekly frequency', () => {
    it('should calculate weeks correctly', () => {
      // 14 days = 2 weeks
      expect(getLeftPayments('2024-03-29', 'weekly')).toBe('2 payments left')
    })

    it('should round up partial weeks', () => {
      // 10 days = 2 weeks (rounded up)
      expect(getLeftPayments('2024-03-25', 'weekly')).toBe('2 payments left')
    })

    it('should calculate weeks across months', () => {
      // From Mar 15 to May 15 = ~9 weeks
      expect(getLeftPayments('2024-05-15', 'weekly')).toBe('9 payments left')
    })
  })

  describe('monthly frequency', () => {
    it('should return 0 for same month and year', () => {
      // Same month, same year
      expect(getLeftPayments('2024-03-25', 'monthly')).toBe('0 payments left')
    })

    it('should calculate months correctly within same year', () => {
      // From March to June = 3 months
      expect(getLeftPayments('2024-06-15', 'monthly')).toBe('3 payments left')
    })

    it('should calculate months correctly across years', () => {
      // From March 2024 to March 2025 = 12 months
      expect(getLeftPayments('2025-03-15', 'monthly')).toBe('12 payments left')
    })

    it('should calculate months correctly for end of year', () => {
      // From March to December = 9 months
      expect(getLeftPayments('2024-12-31', 'monthly')).toBe('9 payments left')
    })

    it('should calculate months correctly across multiple years', () => {
      // From March 2024 to June 2026 = 27 months
      expect(getLeftPayments('2026-06-15', 'monthly')).toBe('27 payments left')
    })

    it('should handle same day next year correctly', () => {
      // From March 15, 2024 to March 15, 2025 = 12 months
      expect(getLeftPayments('2025-03-15', 'monthly')).toBe('12 payments left')
    })
  })

  describe('yearly frequency', () => {
    it('should calculate years correctly', () => {
      // ~1 year = 1 payment
      expect(getLeftPayments('2025-03-15', 'yearly')).toBe('1 payments left')
    })

    it('should round up partial years', () => {
      // 400 days = 2 years (rounded up)
      expect(getLeftPayments('2025-04-20', 'yearly')).toBe('2 payments left')
    })

    it('should calculate multiple years correctly', () => {
      // ~5 years = 5 payments
      expect(getLeftPayments('2029-03-15', 'yearly')).toBe('5 payments left')
    })
  })

  describe('edge cases', () => {
    it('should handle leap year dates', () => {
      jest.setSystemTime(new Date('2024-02-28'))
      // 2024 is a leap year, Feb 29 exists
      expect(getLeftPayments('2024-02-29', 'daily')).toBe('1 payments left')
    })

    it('should handle end of month dates', () => {
      jest.setSystemTime(new Date('2024-01-31'))
      // From Jan 31 to Feb 29 (leap year) = 29 days
      expect(getLeftPayments('2024-02-29', 'daily')).toBe('29 payments left')
    })

    it('should handle today as end date', () => {
      // Same day should be 0 payments left
      expect(getLeftPayments('2024-03-15', 'monthly')).toBe('0 payments left')
      expect(getLeftPayments('2024-03-15', 'daily')).toBe('0 payments left')
    })
  })
})
