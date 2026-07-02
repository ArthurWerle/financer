'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { AverageByCategoryChart } from '@/components/average-by-category-chart'
import { AnalyticsAverages } from '@/components/analytics-averages'
import { CategoryComparisonHistory } from '@/components/category-comparison-history'
import { Card } from '@/components/ui/card'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Analytics</h1>
      <div className="mb-8">
        <CategoryComparisonHistory />
      </div>
      <AnalyticsAverages />
      <div className="mb-6">
        <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />
      </div>
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <AverageByCategoryChart startDate={startDate} endDate={endDate} />
      </Card>
    </div>
  )
}
