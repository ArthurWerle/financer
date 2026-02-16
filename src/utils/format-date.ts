export const humanReadableDate = (date: string) => {
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(parsed)
}
