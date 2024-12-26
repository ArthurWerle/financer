import { Card } from "@/components/ui/card"

const expenseCategories = [
  { name: "Food & Health", percentage: 63, amount: 985.90, color: "red" },
  { name: "Transportation", percentage: 56, amount: 856.20, color: "green" },
  { name: "Shopping", percentage: 48, amount: 742.50, color: "blue" },
  { name: "Entertainment", percentage: 46, amount: 698.30, color: "purple" },
  { name: "Restaurants", percentage: 46, amount: 698.30, color: "teal" },
  { name: "Pets", percentage: 46, amount: 698.30, color: "olive" },
]

export function ExpenseCategories() {
  return (
    <Card className="p-6 bg-white shadow-lg rounded-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Expense Categories</h3>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          {expenseCategories.map((category) => (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{category.name}</span>
                <span className="font-bold text-gray-900">${category.amount.toFixed(2)}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${category.percentage}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500">From</p>
            <p className="text-3xl font-bold text-gray-900">$6,638.72</p>
          </div>
        </div>
      </div>
    </Card>
  )
}