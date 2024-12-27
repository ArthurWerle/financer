import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useExpenseComparsionHistory } from "../queries/transactions/useExpenseComparsionHistory"

export function ExpenseComparsionHistory() {
  const { data: expenseComparsion, isLoading } = useExpenseComparsionHistory()
  const currentYearNumber = new Date().getFullYear()
  const lastYearNumber = new Date().getFullYear() - 1

  if (isLoading) {
    return (
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Expense Comparison</h3>
        <div className="h-[300px]">
          <div className="animate-pulse flex items-center justify-center h-full">
            <div className="w-2/3 h-2/3 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6 bg-white shadow-lg rounded-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Expense Comparison</h3>
      <ChartContainer
        config={{
          currentYear: {
            label: currentYearNumber.toString(),
            color: "hsl(var(--primary))",
          },
          lastYear: {
            label: lastYearNumber.toString(),
            color: "hsl(var(--border))",
          },
        }}
        className="h-[300px] w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={expenseComparsion}>
            <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="currentYear"
              name={currentYearNumber.toString()}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              stroke="var(--color-currentYear)"
            />
            <Line
              type="monotone"
              dataKey="lastYear"
              name={lastYearNumber.toString()}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              stroke="var(--color-lastYear)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}