export const addDate = (date: Date, months: number) => {
  const newDate = new Date(date)
  newDate.setMonth(newDate.getMonth() + months)
  return newDate
}
