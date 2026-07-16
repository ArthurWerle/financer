'use client'

import { ArrowDownLeft, ArrowUpRight, PiggyBank, TrendingUp } from 'lucide-react'
import { useAverage } from '@/queries/types/useAverage'
import { numberToCurrency } from '@/utils/number-to-currency'
import { Skeleton } from '@/components/ui/skeleton'
import { StatTile } from '@/components/stat-tile'

export function AnalyticsAverages() {
  const { data, isLoading } = useAverage()

  const avgIncome = data?.income?.average ?? 0
  const avgExpense = data?.expense?.average ?? 0
  const avgBalance = avgIncome - avgExpense
  const avgSavedPercent = avgIncome > 0
    ? ((avgIncome - avgExpense) / avgIncome) * 100
    : 0

  const cards = [
    {
      label: 'Avg Monthly Income (6 mo)',
      displayValue: numberToCurrency(avgIncome),
      icon: <ArrowDownLeft size={14} className="text-green" />,
      valueClassName: undefined,
    },
    {
      label: 'Avg Monthly Spent (6 mo)',
      displayValue: numberToCurrency(avgExpense),
      icon: <ArrowUpRight size={14} className="text-red" />,
      valueClassName: undefined,
    },
    {
      label: 'Avg Monthly Balance (6 mo)',
      displayValue: numberToCurrency(avgBalance),
      icon: <TrendingUp size={14} className="text-muted-foreground" />,
      valueClassName: avgBalance >= 0 ? 'text-green' : 'text-red',
    },
    {
      label: 'Avg % Saved (6 mo)',
      displayValue: `${avgSavedPercent.toFixed(1)}%`,
      icon: <PiggyBank size={14} className="text-muted-foreground" />,
      valueClassName: avgSavedPercent >= 0 ? 'text-green' : 'text-red',
    },
  ]

  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(190px,1fr))] gap-3">
      {cards.map((card) =>
        isLoading ? (
          <div
            key={card.label}
            className="flex flex-col gap-2 rounded-[10px] border border-border bg-card p-4"
          >
            <span className="text-[11px] font-medium uppercase tracking-[.06em] text-muted-foreground">
              {card.label}
            </span>
            <Skeleton data-testid="skeleton" className="h-5 w-24" />
          </div>
        ) : (
          <StatTile
            key={card.label}
            label={card.label}
            icon={card.icon}
            value={card.displayValue}
            valueClassName={card.valueClassName}
          />
        )
      )}
    </div>
  )
}
