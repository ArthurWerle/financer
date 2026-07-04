'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import {
  ArrowUp,
  ArrowDown,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  PiggyBank,
} from 'lucide-react'
import { useMonthOverview } from '../queries/transactions/useMonthOverview'
import { Skeleton } from '@/components/ui/skeleton'
import { HistoricalData } from './historical-data'
import { ExpenseCategories } from './expense-categories'
import { LatestTransactions } from './latest-transactions'
import { BiggestTransactions } from './biggest-transactions'
import { numberToCurrency } from '@/utils/number-to-currency'
import { useAverage } from '@/queries/types/useAverage'
import { useMonthProjection } from '@/queries/transactions/useMonthProjection'
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
  const { data: projection } = useMonthProjection()

  const income = monthOverview?.income?.currentMonth ?? 0
  const expense = monthOverview?.expense?.currentMonth ?? 0
  const savedPercent = income > 0 ? ((income - expense) / income) * 100 : null

  if (errorOverview || errorAverage) {
    return <p className="text-red-600">Error loading financial data</p>
  }

  if (isLoadingOverview || isLoadingAverage) {
    return (
      <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
        <div className="space-y-2">
          <Skeleton data-testid="skeleton" className="h-4 w-24" />
          <Skeleton data-testid="skeleton" className="h-6 w-32" />
          <Skeleton data-testid="skeleton" className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton data-testid="skeleton" className="h-4 w-24" />
          <Skeleton data-testid="skeleton" className="h-6 w-32" />
          <Skeleton data-testid="skeleton" className="h-4 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:gap-12">
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowDownLeft className="h-6 w-6 text-green-400" />
          {numberToCurrency(monthOverview?.income?.currentMonth ?? 0)}
        </p>
        {!!monthOverview?.income?.currentMonth &&
          !!averageByType?.income?.average && (
            <p
              className={`text-sm ${monthOverview?.income?.currentMonth > averageByType?.income?.average ? 'text-green-600' : 'text-red-600'} flex items-center`}
            >
              {monthOverview?.income?.currentMonth >
              averageByType?.income?.average ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(
                averageByType?.income?.average > 0
                  ? ((monthOverview?.income?.currentMonth -
                      averageByType?.income?.average) /
                      averageByType?.income?.average) *
                      100
                  : 0
              ).toFixed(0)}
              % from 6-month average
            </p>
          )}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowUpRight className="h-6 w-6 text-red-400" />
          {numberToCurrency(monthOverview?.expense?.currentMonth ?? 0)}
        </p>
        {!!monthOverview?.expense?.currentMonth &&
          !!averageByType?.expense?.average && (
            <p
              className={`text-sm ${monthOverview?.expense?.currentMonth > averageByType?.expense?.average ? 'text-red-600' : 'text-green-600'} flex items-center`}
            >
              {monthOverview?.expense?.currentMonth >
              averageByType?.expense?.average ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(
                averageByType?.expense?.average > 0
                  ? ((monthOverview?.expense?.currentMonth -
                      averageByType?.expense?.average) /
                      averageByType?.expense?.average) *
                      100
                  : 0
              ).toFixed(0)}
              % from 6-month average
            </p>
          )}
      </div>
      {savedPercent !== null && (
        <div className="space-y-2">
          <p className="text-3xl font-bold flex items-center gap-2">
            <PiggyBank
              className={`h-6 w-6 ${savedPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}
            />
            <span
              className={savedPercent >= 0 ? 'text-gray-900' : 'text-red-600'}
            >
              {savedPercent.toFixed(0)}%
            </span>
          </p>
          <p className="text-sm text-gray-500">saved this month</p>
        </div>
      )}
      {!!projection?.projected_total && (
        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            {numberToCurrency(projection.projected_total)}
          </p>
          <p className="text-sm text-gray-500">
            projected month spend ·{' '}
            {numberToCurrency(projection.recurring_committed)} recurring
          </p>
        </div>
      )}
    </div>
  )
}

export function Statistics() {
  return (
    <div className="space-y-8">
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Financial Overview
          </h2>
        </div>
        <MonthlyOverview />
      </Card>

      <Card className="p-4 sm:p-6 bg-white shadow-lg rounded-2xl flex flex-col gap-10 lg:flex-row lg:justify-between">
        <ExpenseCategories />
        <div className="flex flex-col flex-1 gap-10">
          <LatestTransactions />
          <BiggestTransactions />
        </div>
      </Card>
      <HistoricalData />
    </div>
  )
}
