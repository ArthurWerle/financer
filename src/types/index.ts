export type Period = {
  id: number
  title: string
  startDate: Date
  endDate: Date | null
  incomes?: Income[]
  outcomes?: Outcome[]
}

export type Income = {
  id: number
  amount: number
  date: Date
  periodId: number
  recursiveFor: number
}

export type Outcome = Income