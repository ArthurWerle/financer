import { Card } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
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

export function HistoricalData() {
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
      <h3 className="mb-4 text-[14px] font-semibold">Income vs expenses</h3>
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
          <LineChart data={incomeAndExpenseComparsion} responsive>
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
