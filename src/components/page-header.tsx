'use client'

import { format } from 'date-fns'
import { AddIncome } from '@/components/add-income'
import { AddExpense } from '@/components/add-expense'

type PageHeaderProps = {
  title: string
  subtitle: string
}

export const PageHeader = ({ title, subtitle }: PageHeaderProps) => {
  const monthChip = format(new Date(), 'MMM yyyy').toUpperCase()

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col gap-0.5">
        <h1 className="text-xl font-semibold tracking-[-0.02em]">{title}</h1>
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap rounded-md border border-border bg-card px-[9px] py-[5px] font-mono text-[11px] text-faint">
          {monthChip}
        </span>
        <AddIncome />
        <AddExpense />
      </div>
    </div>
  )
}
