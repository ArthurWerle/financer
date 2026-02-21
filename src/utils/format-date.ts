export const humanReadableDate = (date: string, showHours: boolean = false) => {
  const parsed = new Date(date)
  if (isNaN(parsed.getTime())) return 'Invalid date'
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: showHours ? '2-digit' : undefined,
    minute: showHours ? '2-digit' : undefined,
    timeZone: 'America/Sao_Paulo',
  }).format(parsed)
}
