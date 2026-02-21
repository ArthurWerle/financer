/**
 * This function receives an `endDate` and a `frequency` and returns
 * how much times this bill will be repeated until the `endDate`.
 *
 * @param endDate Date
 * @param frequency 'daily' | 'weekly' | 'monthly' | 'yearly'
 *
 * @returns string
 *
 * @example
 * getLeftPayments(new Date('2022-12-31'), 'monthly')
 * // Expected output: '12 payments left'
 */
export function getLeftPayments(
  endDateString: string | undefined,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'monthly',
  short: boolean = false
) {
  if (!endDateString) return 'No end date'

  const endDate = new Date(endDateString)
  const today = new Date()

  today.setHours(0, 0, 0, 0)
  endDate.setHours(0, 0, 0, 0)

  const diff = endDate.getTime() - today.getTime()

  if (diff < 0) return 'No payments left'
  if (diff === 0) return 'Last payment 🎉'

  const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))

  switch (frequency) {
    case 'daily':
      return `${diffDays} payments left`
    case 'weekly':
      return `${Math.ceil(diffDays / 7)} payments left`
    case 'monthly':
      const currentYear = today.getFullYear()
      const currentMonth = today.getMonth()
      const endYear = endDate.getFullYear()
      const endMonth = endDate.getMonth()

      const totalMonths =
        (endYear - currentYear) * 12 + (endMonth - currentMonth)

      if (short) return totalMonths

      return `${totalMonths} payments left`
    case 'yearly':
      return `${Math.ceil(diffDays / 365)} payments left`
  }
}
