export type Period = {
  id: number
  title: string
  startDate: Date
  endDate: Date | null
  register?: Register[]
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