export type Period = {
  id: number
  title: string
  startDate: Date
  endDate: Date | null
  incomes?: Register[]
  outcomes?: Register[]
}

export type Register = {
  id: number
  amount: number
  date: Date
  periodId: number
  recursiveFor: number
  description?: string
  type: string
}