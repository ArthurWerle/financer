'use client'

import { useState, useMemo } from 'react'
import { ArrowDownLeft, ArrowUpRight, TrendingUp } from 'lucide-react'
import { useMonthOverview } from '@/queries/transactions/useMonthOverview'
import { useBiggestTransactions } from '@/queries/transactions/useBiggestTransactions'
import { useCategories } from '@/queries/categories/useCategories'
import { numberToCurrency } from '@/utils/number-to-currency'
import { Transaction } from '@/components/transaction'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
import { StatTile } from '@/components/stat-tile'
import { ExpenseCategories } from '@/components/expense-categories'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function buildMonthOptions() {
  const options: { label: string; month: number; year: number }[] = []
  const now = new Date()
  const start = new Date(2025, 0) // Jan 2025
  const current = new Date(now.getFullYear(), now.getMonth())

  for (let d = new Date(start); d <= current; d.setMonth(d.getMonth() + 1)) {
    options.push({
      label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`,
      month: d.getMonth() + 1,
      year: d.getFullYear(),
    })
  }

  return options.reverse()
}

export default function HistoryPage() {
  const monthOptions = useMemo(() => buildMonthOptions(), [])
  const [selected, setSelected] = useState(monthOptions[0])

  const params = { month: selected.month, year: selected.year }

  const { data: overview, isLoading: isLoadingOverview } = useMonthOverview(params)
  const { data: biggestData, isLoading: isLoadingBiggest } = useBiggestTransactions(params)
  const { data: categories = [] } = useCategories()

  const income = overview?.income?.currentMonth ?? 0
  const expense = overview?.expense?.currentMonth ?? 0
  const balance = income - expense

  const biggestTransactions = biggestData?.transactions ?? []

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="History"
        subtitle="Review your finances month by month"
      />
      <div className="flex justify-end">
        <select
          className="h-8 rounded-[7px] border border-border bg-card px-2.5 text-[12.5px] font-medium text-foreground outline-none w-full sm:w-auto"
          value={`${selected.year}-${selected.month}`}
          onChange={(e) => {
            const found = monthOptions.find(
              (o) => `${o.year}-${o.month}` === e.target.value
            )
            if (found) setSelected(found)
          }}
        >
          {monthOptions.map((o) => (
            <option key={`${o.year}-${o.month}`} value={`${o.year}-${o.month}`}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        {isLoadingOverview ? (
          ['Income', 'Expenses', 'Balance'].map((label) => (
            <div
              key={label}
              className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4"
            >
              <span className="text-[11px] font-medium uppercase tracking-[.06em] text-muted-foreground">
                {label}
              </span>
              <Skeleton className="h-5 w-24" />
            </div>
          ))
        ) : (
          <>
            <StatTile
              label="Income"
              icon={<ArrowDownLeft size={14} className="text-green" />}
              value={numberToCurrency(income)}
            />
            <StatTile
              label="Expenses"
              icon={<ArrowUpRight size={14} className="text-red" />}
              value={numberToCurrency(expense)}
            />
            <StatTile
              label="Balance"
              icon={<TrendingUp size={14} className="text-muted-foreground" />}
              value={numberToCurrency(balance)}
              valueClassName={balance >= 0 ? 'text-green' : 'text-red'}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 items-start lg:grid-cols-[5fr_7fr]">
        <ExpenseCategories month={selected.month} year={selected.year} />

        <div className="rounded-[10px] border border-border bg-card p-5">
          <h2 className="mb-3 text-[14px] font-semibold">
            Biggest transactions
          </h2>
          {isLoadingBiggest ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : biggestTransactions.length === 0 ? (
            <p className="text-[12.5px] text-muted-foreground">
              No transactions for this month.
            </p>
          ) : (
            <ul>
              {biggestTransactions.map((transaction, index) => (
                <Transaction
                  key={transaction.id}
                  categories={categories}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
