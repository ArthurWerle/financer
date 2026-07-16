'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { DateRange } from 'react-day-picker'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { Button } from '@/components/ui/button'
import MultiSelect from '@/components/multi-select'
import { useCategories } from '@/queries/categories/useCategories'
import { useCategoryComparisonHistory } from '@/queries/transactions/useCategoryComparisonHistory'
import { Category } from '@/types/category'
import { CHART_RAMP } from '@/utils/chart-colors'

type Mode = 'expense' | 'income'

export function CategoryComparisonHistory() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [mode, setMode] = useState<Mode>('expense')

  const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
  const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined
  const categoryParam = selectedCategories.length > 0 ? selectedCategories.join(',') : undefined

  const { data: categories = [] } = useCategories()
  const { data, isLoading, isError } = useCategoryComparisonHistory({
    start_date: startDate,
    end_date: endDate,
    category: categoryParam,
  })

  const allMonths = data
    ? [...new Set(data.flatMap((cat) => cat.data.map((d) => d.month)))]
    : []

  const mergedData = allMonths.map((month) => {
    const entry: Record<string, string | number> = { month }
    data?.forEach((cat) => {
      const point = cat.data.find((d) => d.month === month)
      entry[cat.category_name] = point ? point[mode] : 0
    })
    return entry
  })

  const chartConfig = Object.fromEntries(
    (data ?? []).map((cat, index) => [
      cat.category_name,
      { label: cat.category_name, color: CHART_RAMP[index % CHART_RAMP.length] },
    ])
  )

  return (
    <Card className="rounded-[10px] border-border p-5 shadow-none">
      <h3 className="mb-4 text-[14px] font-semibold">
        Category comparison history
      </h3>

      <div className="flex flex-wrap gap-3 mb-6 items-start">
        <div className="flex rounded-md border border-border overflow-hidden">
          <Button
            onClick={() => setMode('expense')}
            variant="ghost"
            className={`h-7 rounded-none px-2.5 text-xs ${mode === 'expense' ? 'bg-panel2 font-semibold text-foreground' : 'text-muted-foreground'}`}
          >
            Expense
          </Button>
          <Button
            onClick={() => setMode('income')}
            variant="ghost"
            className={`h-7 rounded-none border-l border-border px-2.5 text-xs ${mode === 'income' ? 'bg-panel2 font-semibold text-foreground' : 'text-muted-foreground'}`}
          >
            Income
          </Button>
        </div>

        <MultiSelect
          options={categories.map((cat: Category) => ({
            value: String(cat.id),
            label: cat.name,
          }))}
          value={selectedCategories}
          onChange={setSelectedCategories}
          placeholder="Filter categories"
          groupLabel="Categories"
        />

        <DatePickerWithRange selected={dateRange} onSelect={setDateRange} />

        {(selectedCategories.length > 0 || dateRange) && (
          <Button
            variant="outline"
            onClick={() => {
              setSelectedCategories([])
              setDateRange(undefined)
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {isError && (
        <p className="text-[12.5px] text-destructive">
          Error loading category comparison data
        </p>
      )}

      {isLoading && (
        <div className="h-[300px]">
          <div className="animate-pulse flex items-center justify-center h-full">
            <div className="w-2/3 h-2/3 rounded-lg bg-panel2" />
          </div>
        </div>
      )}

      {!isLoading && !isError && data && data.length === 0 && (
        <div className="h-[300px] flex items-center justify-center text-[12.5px] text-muted-foreground">
          No data available for the selected filters
        </div>
      )}

      {!isLoading && !isError && data && data.length > 0 && (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedData}>
              <XAxis
                dataKey="month"
                stroke="var(--faint)"
                fontSize={10.5}
                fontFamily="var(--font-geist-mono)"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" />
              <YAxis
                stroke="var(--faint)"
                fontSize={10.5}
                fontFamily="var(--font-geist-mono)"
                tickLine={false}
                axisLine={{ stroke: 'var(--border)' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              {data.map((cat, index) => (
                <Line
                  key={cat.category_id}
                  type="monotone"
                  dataKey={cat.category_name}
                  strokeWidth={2}
                  dot={true}
                  stroke={CHART_RAMP[index % CHART_RAMP.length]}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}
    </Card>
  )
}
