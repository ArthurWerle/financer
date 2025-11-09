'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { ArrowUp, ArrowDown, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { useMonthOverview } from '../queries/transactions/useMonthOverview'
import { Skeleton } from '@/components/ui/skeleton'
import { ExpenseComparsionHistory } from './expense-comparsion-history'
import { ExpenseCategories } from './expense-categories'
import { LatestTransactions } from './latest-transactions'
import { BiggestTransactions } from './biggest-transactions'
import { numberToCurrency } from '@/utils/number-to-currency'
import { useAverage } from '@/queries/types/useAverage'
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

  if (errorOverview || errorAverage) {
    return <p className="text-red-600">Error loading financial data</p>
  }

  if (isLoadingOverview || isLoadingAverage) {
    return (
      <div className="flex gap-12">
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
    <div className="flex gap-12">
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowDownLeft className="h-6 w-6 text-green-400" />
          {numberToCurrency(monthOverview?.income?.currentMonth ?? 0)}
        </p>
        {!!monthOverview?.income?.currentMonth &&
          !!averageByType?.income?.Average && (
            <p
              className={`text-sm ${monthOverview?.income?.currentMonth > averageByType?.income?.Average ? 'text-green-600' : 'text-red-600'} flex items-center`}
            >
              {monthOverview?.income?.currentMonth >
              averageByType?.income?.Average ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(
                averageByType?.income?.Average > 0
                  ? ((monthOverview?.income?.currentMonth -
                      averageByType?.income?.Average) /
                      averageByType?.income?.Average) *
                      100
                  : 0
              ).toFixed(0)}
              % from average month
            </p>
          )}
      </div>
      <div className="space-y-2">
        <p className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <ArrowUpRight className="h-6 w-6 text-red-400" />
          {numberToCurrency(monthOverview?.expense?.currentMonth ?? 0)}
        </p>
        {!!monthOverview?.expense?.currentMonth &&
          !!averageByType?.expense?.Average && (
            <p
              className={`text-sm ${monthOverview?.expense?.currentMonth > averageByType?.expense?.Average ? 'text-red-600' : 'text-green-600'} flex items-center`}
            >
              {monthOverview?.expense?.currentMonth >
              averageByType?.expense?.Average ? (
                <ArrowUp className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDown className="w-4 h-4 mr-1" />
              )}
              {Math.abs(
                averageByType?.expense?.Average > 0
                  ? ((monthOverview?.expense?.currentMonth -
                      averageByType?.expense?.Average) /
                      averageByType?.expense?.Average) *
                      100
                  : 0
              ).toFixed(0)}
              % from average month
            </p>
          )}
      </div>
    </div>
  )
}

export function Statistics() {
  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Financial Overview
          </h2>
        </div>
        <MonthlyOverview />
      </Card>

      <Card className="p-6 bg-white shadow-lg rounded-2xl flex justify-between">
        <ExpenseCategories />
        <div className="flex flex-col flex-1 gap-10">
          <LatestTransactions />
          <BiggestTransactions />
        </div>
      </Card>
      <ExpenseComparsionHistory />
    </div>
  )
}
