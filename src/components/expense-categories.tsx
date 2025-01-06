import { Card } from "@/components/ui/card"
import { useCategoriesMonthyExpense } from "../queries/categories/useCategoriesMonthlyExpense"
import { useMonthOverview } from "../queries/transactions/useMonthOverview"

export function ExpenseCategories() {
  const { data: expenseCategories, isLoading: isLoadingMonthlyCategoriesExpense } = useCategoriesMonthyExpense()
  const { data: response, isLoading } = useMonthOverview()
  const { expense } = response || {}

  return (
    <Card className="p-6 bg-white shadow-lg rounded-2xl">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">Monthly expense by category</h3>
      <div className="grid gap-6 md:grid-cols-2">
        {isLoading || isLoadingMonthlyCategoriesExpense ? (
          <div className="h-24 bg-gray-100 rounded-lg" />
        ) : (
          <div className="space-y-4">
            {expenseCategories && Object.keys(expenseCategories).map((key) => {
              const categoryPercentage = (expenseCategories[key]/(expense?.currentMonth || 0))*100
  
              return (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">{key}</span>
                    <span className="font-bold text-gray-900">${expenseCategories[key].toFixed(2)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full bg-[#2563eb]`}
                      style={{width: `${categoryPercentage}%`}}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}