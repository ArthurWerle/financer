'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import {
  useAverageByCategory,
  CategoryAverage,
} from '@/queries/transactions/useAverageByCategory'
import { numberToCurrency } from '@/utils/number-to-currency'

const COLORS = [
  '#3b82f6',
  '#f97316',
  '#22c55e',
  '#eab308',
  '#14b8a6',
  '#60a5fa',
  '#818cf8',
  '#a78bfa',
  '#f472b6',
  '#ef4444',
]

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean
  payload?: { payload: CategoryAverage }[]
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <Card>
        <CardContent className="flex flex-col gap-1 px-4 py-3 text-sm">
          <p className="font-bold text-base">{data.category_name}</p>
          <p>
            <span className="text-gray-500">Monthly avg: </span>
            <span className="font-medium">
              {numberToCurrency(data.average)}
            </span>
          </p>
          <p>
            <span className="text-gray-500">Total spent: </span>
            <span className="font-medium">
              {numberToCurrency(data.total_spent)}
            </span>
          </p>
        </CardContent>
      </Card>
    )
  }
  return null
}

type Props = {
  startDate?: string
  endDate?: string
}

export function AverageByCategoryChart({ startDate, endDate }: Props) {
  const { data, isLoading } = useAverageByCategory({ startDate, endDate })

  const sorted = data ? [...data].sort((a, b) => b.average - a.average) : []

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Average monthly spending by category
      </h3>
      {isLoading ? (
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={sorted.length * 44}>
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ top: 0, right: 24, left: 100, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              tickFormatter={(v) => numberToCurrency(v)}
              tick={{ fontSize: 11 }}
              width={100}
            />
            <YAxis
              type="category"
              dataKey="category_name"
              tick={{ fontSize: 12 }}
              width={135}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="average" radius={[0, 4, 4, 0]}>
              {sorted.map((entry, index) => (
                <Cell
                  key={`cell-${entry.category_id}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
