'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { AverageSpendingBars } from '@/components/average-spending-bars'
import { AnalyticsAverages } from '@/components/analytics-averages'
import { CategoryComparisonHistory } from '@/components/category-comparison-history'
import { Card } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { PageHeader } from '@/components/page-header'

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Analytics"
        subtitle="Six-month averages and trends"
      />
      <AnalyticsAverages />

      <Card className="rounded-[10px] border-border p-5 shadow-none">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-[14px] font-semibold">
            Average monthly spending by category
          </h2>
          <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
        </div>
        <AverageSpendingBars startDate={startDate} endDate={endDate} />
      </Card>

      <CategoryComparisonHistory />
    </div>
  )
}
