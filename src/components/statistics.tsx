'use client'

import React from 'react'
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  RefreshCw,
} from 'lucide-react'
import { useMonthOverview } from '../queries/transactions/useMonthOverview'
import { Skeleton } from '@/components/ui/skeleton'
import { HistoricalData } from './historical-data'
import { ExpenseCategories } from './expense-categories'
import { LatestTransactions } from './latest-transactions'
import { BiggestTransactions } from './biggest-transactions'
import { StatTile } from './stat-tile'
import { numberToCurrency } from '@/utils/number-to-currency'
import { useAverage } from '@/queries/types/useAverage'
import { useRecurringExpenseTotal } from '../queries/transactions/useRecurringExpenseTotal'
export function MonthlyOverview() {
  const {
    data: averageByType,
    isLoading: isLoadingAverage,
    error: errorAverage,
  } = useAverage()
  const {
    data: monthOverview,
    isLoading: isLoadingOverview,
    error: errorOverview,
  } = useMonthOverview()
  const { data: recurringExpense } = useRecurringExpenseTotal()

  const currentExpense = monthOverview?.expense?.currentMonth ?? 0
  const recurringPercent =
    !!recurringExpense && currentExpense > 0
      ? Math.round((recurringExpense / currentExpense) * 100)
      : 0

  if (errorOverview || errorAverage) {
    return <p className="text-destructive">Error loading financial data</p>
  }

  if (isLoadingOverview || isLoadingAverage) {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
        {['Income', 'Expenses', 'Balance', 'Recurring'].map((label) => (
          <div
            key={label}
            className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4"
          >
            <span className="text-[11px] font-medium uppercase tracking-[.06em] text-muted-foreground">
              {label}
            </span>
            <Skeleton data-testid="skeleton" className="h-5 w-24" />
          </div>
        ))}
      </div>
    )
  }

  const income = monthOverview?.income?.currentMonth ?? 0
  const expense = monthOverview?.expense?.currentMonth ?? 0
  const balance = income - expense
  const incomeAverage = averageByType?.income?.average ?? 0
  const expenseAverage = averageByType?.expense?.average ?? 0
  const incomeSavedPercent = income > 0 ? (balance / income) * 100 : 0

  const incomeAboveAverage = income > incomeAverage
  const incomePercentDelta = Math.abs(
    incomeAverage > 0 ? ((income - incomeAverage) / incomeAverage) * 100 : 0
  ).toFixed(0)

  const expenseAboveAverage = expense > expenseAverage
  const expensePercentDelta = Math.abs(
    expenseAverage > 0 ? ((expense - expenseAverage) / expenseAverage) * 100 : 0
  ).toFixed(0)

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
      <StatTile
        label="Income"
        icon={<ArrowDownLeft size={14} className="text-green" />}
        value={numberToCurrency(income)}
        footnote={
          !!income && !!incomeAverage ? (
            <span className={incomeAboveAverage ? 'text-green' : 'text-red'}>
              {incomeAboveAverage ? (
                <ArrowUp className="mr-1 inline h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 inline h-3 w-3" />
              )}
              {incomePercentDelta}% from 6-month average
            </span>
          ) : undefined
        }
      />
      <StatTile
        label="Expenses"
        icon={<ArrowUpRight size={14} className="text-red" />}
        value={numberToCurrency(expense)}
        footnote={
          !!expense && !!expenseAverage ? (
            <span className={expenseAboveAverage ? 'text-red' : 'text-green'}>
              {expenseAboveAverage ? (
                <ArrowUp className="mr-1 inline h-3 w-3" />
              ) : (
                <ArrowDown className="mr-1 inline h-3 w-3" />
              )}
              {expensePercentDelta}% from 6-month average
            </span>
          ) : undefined
        }
      />
      <StatTile
        label="Balance"
        icon={<TrendingUp size={14} className="text-muted-foreground" />}
        value={numberToCurrency(balance)}
        valueClassName={balance >= 0 ? 'text-green' : 'text-red'}
        footnote={
          income > 0
            ? `${incomeSavedPercent.toFixed(0)}% of income saved`
            : undefined
        }
      />
      <StatTile
        label="Recurring"
        icon={<RefreshCw size={14} className="text-muted-foreground" />}
        value={numberToCurrency(recurringExpense ?? 0)}
        footnote={
          !!recurringExpense && currentExpense > 0
            ? `${recurringPercent}% of expenses`
            : undefined
        }
      />
    </div>
  )
}

export function Statistics() {
  return (
    <div className="flex flex-col gap-4">
      <MonthlyOverview />
      <HistoricalData />
      <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-[5fr_7fr]">
        <ExpenseCategories />
        <div className="flex flex-col gap-3">
          <LatestTransactions />
          <BiggestTransactions />
        </div>
      </div>
    </div>
  )
}
