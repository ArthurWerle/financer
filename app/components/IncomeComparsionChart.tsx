import { Card } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

const monthlyData = [
  { month: "Jan", currentMonth: 9500, lastMonth: 9000 },
  { month: "Feb", currentMonth: 11200, lastMonth: 10500 },
  { month: "Mar", currentMonth: 10800, lastMonth: 10200 },
  { month: "Apr", currentMonth: 9800, lastMonth: 9600 },
  { month: "May", currentMonth: 10200, lastMonth: 9800 },
  { month: "Jun", currentMonth: 9700, lastMonth: 9400 },
  { month: "Jul", currentMonth: 16281, lastMonth: 15000 },
  { month: "Aug", currentMonth: 15000, lastMonth: 14500 },
  { month: "Sep", currentMonth: 13500, lastMonth: 13000 },
  { month: "Oct", currentMonth: 14200, lastMonth: 13800 },
  { month: "Nov", currentMonth: 15800, lastMonth: 15200 },
  { month: "Dec", currentMonth: 16000, lastMonth: 15500 },
]

export function IncomeComparsionChart() {
  return (
    <Card className="p-6 bg-white shadow-lg rounded-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Income Comparison</h3>
      <ChartContainer
        config={{
          currentMonth: {
            label: "Current Month",
            color: "hsl(var(--chart-1))",
          },
          lastMonth: {
            label: "Last Month",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-[300px]"
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend verticalAlign="top" height={36} />
            <Line
              type="monotone"
              dataKey="currentMonth"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              stroke="var(--color-currentMonth)"
            />
            <Line
              type="monotone"
              dataKey="lastMonth"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 8 }}
              stroke="var(--color-lastMonth)"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </Card>
  )
}