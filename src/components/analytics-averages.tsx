'use client'

import { Card } from '@/components/ui/card'
import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react'
import { useAverage } from '@/queries/types/useAverage'
import { numberToCurrency } from '@/utils/number-to-currency'
import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsAverages() {
  const { data, isLoading } = useAverage()

  const avgIncome = data?.income?.Average ?? 0
  const avgExpense = data?.expense?.Average ?? 0
  const avgBalance = avgIncome - avgExpense
  const avgSavedPercent = avgIncome > 0
    ? ((avgIncome - avgExpense) / avgIncome) * 100
    : 0

  const cards = [
    {
      label: 'Avg Monthly Income (6 mo)',
      displayValue: numberToCurrency(avgIncome),
      icon: <ArrowDownLeft className="h-5 w-5 text-green-400" />,
      valueColor: 'text-gray-900',
    },
    {
      label: 'Avg Monthly Spent (6 mo)',
      displayValue: numberToCurrency(avgExpense),
      icon: <ArrowUpRight className="h-5 w-5 text-red-400" />,
      valueColor: 'text-gray-900',
    },
    {
      label: 'Avg Monthly Balance (6 mo)',
      displayValue: numberToCurrency(avgBalance),
      icon: <TrendingUp className="h-5 w-5 text-blue-400" />,
      valueColor: avgBalance >= 0 ? 'text-green-600' : 'text-red-600',
    },
    {
      label: 'Avg % Saved (6 mo)',
      displayValue: `${avgSavedPercent.toFixed(1)}%`,
      icon: <PiggyBank className="h-5 w-5 text-blue-400" />,
      valueColor: avgSavedPercent >= 0 ? 'text-green-600' : 'text-red-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card) => (
        <Card
          key={card.label}
          className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl"
        >
          <p className="text-sm text-muted-foreground mb-1">{card.label}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-36" />
          ) : (
            <p className={`text-3xl font-bold flex items-center gap-2 ${card.valueColor}`}>
              {card.icon}
              {card.displayValue}
            </p>
          )}
        </Card>
      ))}
    </div>
  )
}
