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
export function getLeftPayments(endDate: Date, frequency: 'daily' | 'weekly' | 'monthly' | 'yearly') {
    const today = new Date()
    const diff = Math.abs(endDate.getTime() - today.getTime())
    const diffDays = Math.ceil(diff / (1000 * 60 * 60 * 24))
    
    switch (frequency) {
      case 'daily':
        return `${diffDays} payments left`
      case 'weekly':
        return `${Math.ceil(diffDays / 7)} payments left`
      case 'monthly':
        const currentMonth = today.getMonth()
        const endMonth = endDate.getMonth()

        return `${endMonth - currentMonth} payments left`
      case 'yearly':
        return `${Math.ceil(diffDays / 365)} payments left`
    }
}