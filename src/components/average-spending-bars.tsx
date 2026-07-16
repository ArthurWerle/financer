'use client'

import { useAverageByCategory } from '@/queries/transactions/useAverageByCategory'
import { numberToCurrency } from '@/utils/number-to-currency'
import { CHART_RAMP } from '@/utils/chart-colors'

type Props = {
  startDate?: string
  endDate?: string
}

export function AverageSpendingBars({ startDate, endDate }: Props) {
  const { data, isLoading } = useAverageByCategory({
    start_date: startDate,
    end_date: endDate,
  })

  const sorted = data ? [...data].sort((a, b) => b.average - a.average) : []
  const max = sorted.length > 0 ? sorted[0].average : 0

  if (isLoading) {
    return <div className="h-64 rounded-lg bg-panel2 animate-pulse" />
  }

  if (sorted.length === 0) {
    return (
      <p className="py-8 text-center text-[12.5px] text-muted-foreground">
        No data for the selected period.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-[11px]">
      {sorted.map((entry, index) => (
        <div
          key={entry.category_id}
          className="grid grid-cols-[110px_1fr_90px] items-center gap-3"
        >
          <span className="truncate text-right text-[12.5px] text-muted-foreground">
            {entry.category_name}
          </span>
          <div className="h-[18px] overflow-hidden rounded-[4px] bg-panel2">
            <div
              className="h-full rounded-[4px]"
              style={{
                width: `${max > 0 ? (entry.average / max) * 100 : 0}%`,
                backgroundColor: CHART_RAMP[index % CHART_RAMP.length],
              }}
            />
          </div>
          <span className="font-mono text-[12px] text-muted-foreground">
            {numberToCurrency(entry.average)}
          </span>
        </div>
      ))}
    </div>
  )
}
