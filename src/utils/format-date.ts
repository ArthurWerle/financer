export const getValidDate = (date: string) => new Date(date.replace(/\.\d{1,2}$/, (m) => m.padEnd(4, '0')))

export const humanReadableDate = (date: string) => {
  const validDate = getValidDate(date)

  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long', 
    year: 'numeric',
    month: 'long',   
    day: 'numeric'  
  }).format(validDate)
}