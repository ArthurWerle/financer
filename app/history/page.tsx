'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { useMonthOverview } from '@/queries/transactions/useMonthOverview'
import { useCategoriesMonthyExpense } from '@/queries/categories/useCategoriesMonthlyExpense'
import { useBiggestTransactions } from '@/queries/transactions/useBiggestTransactions'
import { useCategories } from '@/queries/categories/useCategories'
import { numberToCurrency } from '@/utils/number-to-currency'
import { Transaction } from '@/components/transaction'
import { Cell, Legend, Pie, PieChart, Tooltip } from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'

const COLORS = [
  '#3b82f6',
  '#f97316',
  '#22c55e',
  '#eab308',
  '#14b8a6',
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#f472b6',
  '#ef4444',
]

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

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { rawValue: number } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="flex flex-col justify-center items-center px-3 py-1 text-[12px]">
          <p className="font-bold">{payload[0].name}</p>
          <p>{numberToCurrency(payload[0]?.payload?.rawValue)}</p>
          <p className="italic">{payload[0].value}% of total</p>
        </CardContent>
      </Card>
    )
  }
  return null
}

export default function HistoryPage() {
  const monthOptions = buildMonthOptions()
  const [selected, setSelected] = useState(monthOptions[0])

  const params = { month: selected.month, year: selected.year }

  const { data: overview, isLoading: isLoadingOverview } = useMonthOverview(params)
  const { data: expenseCategories, isLoading: isLoadingCategories } = useCategoriesMonthyExpense(params)
  const { data: biggestData, isLoading: isLoadingBiggest } = useBiggestTransactions(params)
  const { data: categories = [] } = useCategories()

  const income = overview?.income?.currentMonth ?? 0
  const expense = overview?.expense?.currentMonth ?? 0
  const balance = income - expense

  const categoryData =
    expenseCategories && expense > 0
      ? Object.keys(expenseCategories).map((key) => ({
          name: key,
          value: Number(((expenseCategories[key] / expense) * 100).toFixed(0)),
          rawValue: expenseCategories[key],
        }))
      : []

  const biggestTransactions = biggestData?.transactions ?? []

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">History</h1>
          <p className="text-muted-foreground">Review your finances month by month</p>
        </div>
        <select
          className="border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
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

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
          <p className="text-sm text-muted-foreground mb-1">Income</p>
          {isLoadingOverview ? (
            <Skeleton className="h-8 w-36" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowDownLeft className="h-6 w-6 text-green-400" />
              {numberToCurrency(income)}
            </p>
          )}
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
          <p className="text-sm text-muted-foreground mb-1">Expenses</p>
          {isLoadingOverview ? (
            <Skeleton className="h-8 w-36" />
          ) : (
            <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ArrowUpRight className="h-6 w-6 text-red-400" />
              {numberToCurrency(expense)}
            </p>
          )}
        </Card>

        <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
          <p className="text-sm text-muted-foreground mb-1">Total Balance</p>
          {isLoadingOverview ? (
            <Skeleton className="h-8 w-36" />
          ) : (
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {numberToCurrency(balance)}
            </p>
          )}
        </Card>
      </div>

      {/* Expenses by category + Biggest transactions */}
      <Card className="p-6 bg-white shadow-lg rounded-2xl flex justify-between gap-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Expenses by category
          </h3>
          {isLoadingCategories ? (
            <div className="h-[300px] w-[300px] bg-gray-100 rounded-lg" />
          ) : categoryData.length === 0 ? (
            <p className="text-muted-foreground text-sm">No expense data for this month.</p>
          ) : (
            <div className="w-[500px] h-[500px]">
              <PieChart style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '80vh', aspectRatio: 1 }} responsive>
                <Pie data={categoryData} cx="50%" cy="50%" labelLine={false} outerRadius={180} fill="#8884d8" dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
            Biggest transactions
          </h3>
          {isLoadingBiggest ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : biggestTransactions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No transactions for this month.</p>
          ) : (
            <ul>
              {biggestTransactions.map((transaction, index) => (
                <Transaction
                  key={transaction.amount + index + transaction.amount}
                  categories={categories}
                  transaction={transaction}
                  index={index}
                />
              ))}
            </ul>
          )}
        </div>
      </Card>
    </div>
  )
}
