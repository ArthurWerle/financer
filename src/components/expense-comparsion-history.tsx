import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { useIncomeAndExpenseComparsionHistory } from "../queries/transactions/useExpenseComparsionHistory"

export function ExpenseComparsionHistory() {
  const { data: incomeAndExpenseComparsion, isLoading, isError } = useIncomeAndExpenseComparsionHistory()
  const currentYearNumber = new Date().getFullYear()
  const lastYearNumber = new Date().getFullYear() - 1

  if (isError) {
    return (
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Expense Comparison</h3>
        <p className="text-red-600">Error loading income and expense comparison history</p>
      </Card>
    )
  }

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
          <LineChart data={incomeAndExpenseComparsion}>
            <XAxis dataKey="month" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              stroke="#4ade80"
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              stroke="rgb(248 113 113)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}