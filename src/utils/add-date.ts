/**
 * Adds `months` calendar months to a date, anchored to the month rather than
 * the day: when the target month is shorter, the day clamps to its last day
 * (Jan 31 + 1 month = Feb 28/29, not Mar 3).
 */
export const addDate = (date: Date, months: number) => {
  const totalMonths = date.getMonth() + months
  const year = date.getFullYear() + Math.floor(totalMonths / 12)
  const month = ((totalMonths % 12) + 12) % 12
  const lastDayOfTargetMonth = new Date(year, month + 1, 0).getDate()
  const day = Math.min(date.getDate(), lastDayOfTargetMonth)
  return new Date(year, month, day)
}
