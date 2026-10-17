import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useState } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import { useIncomeAndExpenseComparsionHistory } from '../queries/transactions/useExpenseComparsionHistory'

type Range = 'last-12' | 'all'

export const LAST_MONTHS = 12

export function limitToRange<T>(data: T[] | undefined, range: Range) {
  if (!data) return data
  return range === 'last-12' ? data.slice(-LAST_MONTHS) : data
}

export function HistoricalData() {
  const [range, setRange] = useState<Range>('last-12')
  const {
    data: incomeAndExpenseComparsion,
    isLoading,
    isError,
  } = useIncomeAndExpenseComparsionHistory()

  if (isError) {
    return (
      <Card className="rounded-[10px] border-border p-5 shadow-none">
        <h3 className="mb-4 text-[14px] font-semibold">
          Income vs expenses
        </h3>
        <p className="text-[12.5px] text-destructive">
          Error loading historical data
        </p>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="rounded-[10px] border-border p-5 shadow-none">
        <h3 className="mb-4 text-[14px] font-semibold">
          Income vs expenses
        </h3>
        <div className="h-[300px]">
          <div className="animate-pulse flex items-center justify-center h-full">
            <div className="w-2/3 h-2/3 rounded-lg bg-panel2" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-[10px] border-border p-5 shadow-none">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[14px] font-semibold">Income vs expenses</h3>
        <Select value={range} onValueChange={(v) => setRange(v as Range)}>
          <SelectTrigger
            className="h-8 w-[150px] text-[12.5px]"
            aria-label="Range"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last-12">Last 12 months</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ChartContainer
        config={{
          income: {
            label: 'Income',
            color: 'var(--green)',
          },
          expense: {
            label: 'Expense',
            color: 'var(--red)',
          },
          balance: {
            label: 'Balance',
            color: 'var(--faint)',
          },
        }}
        className="h-[300px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={limitToRange(incomeAndExpenseComparsion, range)} responsive>
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
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              strokeWidth={2}
              dot={true}
              stroke="var(--green)"
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              strokeWidth={2}
              dot={true}
              activeDot={{ r: 8 }}
              stroke="var(--red)"
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="Balance"
              strokeWidth={1.5}
              strokeDasharray="6 4"
              dot={false}
              stroke="var(--faint)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}
