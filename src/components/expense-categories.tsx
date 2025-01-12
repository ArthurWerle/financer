import { Card, CardContent } from "@/components/ui/card"
import { useCategoriesMonthyExpense } from "../queries/categories/useCategoriesMonthlyExpense"
import { useMonthOverview } from "../queries/transactions/useMonthOverview"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

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
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center px-4 py-2">
          <p>{`${payload[0].name}: ${payload[0].value}%`}</p>
        </CardContent>
      </Card>
    )
  }

  return null
}


export function ExpenseCategories() {
  const { data: expenseCategories, isLoading: isLoadingMonthlyCategoriesExpense } = useCategoriesMonthyExpense()
  const { data: response, isLoading } = useMonthOverview()
  const { expense } = response || {}

  const data =
    expenseCategories && expense?.currentMonth
      ? Object.keys(expenseCategories).map((key) => ({
          name: key,
          value: Number(((expenseCategories[key] / expense.currentMonth) * 100).toFixed(0)),
        }))
      : []

  return (
    <Card className="p-6 bg-white shadow-lg rounded-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Monthly expenses by category</h3>
      <div>
        {isLoading || isLoadingMonthlyCategoriesExpense ? (
          <div className="h-24 bg-gray-100 rounded-lg" />
        ) : (
          <div className="w-[500px] h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart width={600} height={600}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={180}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                  <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </Card>
  )
}
