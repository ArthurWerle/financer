import { useCategoriesMonthyExpense } from '../queries/categories/useCategoriesMonthlyExpense'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { numberToCurrency } from '../utils/number-to-currency'
import { CHART_RAMP } from '../utils/chart-colors'

type ExpenseCategoriesProps = {
  month?: number
  year?: number
}

export function ExpenseCategories({ month, year }: ExpenseCategoriesProps = {}) {
  const { data: expenseCategories, isLoading } = useCategoriesMonthyExpense(
    month && year ? { month, year } : undefined
  )

  // Slices carry the raw amounts and percentages of the slice total, so the
  // chart always reconciles to 100% regardless of any other endpoint.
  const entries = expenseCategories ? Object.entries(expenseCategories) : []
  const totalExpenses = entries.reduce((acc, [, value]) => acc + value, 0)
  const data =
    totalExpenses > 0
      ? entries
          .map(([name, value]) => ({
            name,
            value,
            percent: Number(((value / totalExpenses) * 100).toFixed(1)),
          }))
          .sort((a, b) => b.value - a.value)
      : []

  return (
    <div className="rounded-[10px] border border-border bg-card p-5">
      <h2 className="mb-4 text-[14px] font-semibold">Expenses by category</h2>
      {isLoading ? (
        <div className="h-[170px] w-[170px] mx-auto rounded-full bg-panel2 animate-pulse" />
      ) : data.length === 0 ? (
        <p className="py-8 text-center text-[12.5px] text-muted-foreground">
          No expense data for this period.
        </p>
      ) : (
        <>
          <div className="relative flex justify-center py-1.5 pb-4">
            <div className="h-[170px] w-[170px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={62}
                    outerRadius={70}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.map((_, index) => (
                      <Cell key={index} fill={CHART_RAMP[index % CHART_RAMP.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="font-mono text-[16px] font-semibold">
                {numberToCurrency(totalExpenses).split(',')[0]}
              </span>
              <span className="text-[10.5px] uppercase tracking-[.06em] text-faint">
                total spent
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-[9px]">
            {data.map((entry, index) => (
              <div
                key={entry.name}
                className="grid grid-cols-[10px_1fr_auto_auto] items-center gap-[9px]"
              >
                <span
                  className="h-2 w-2 rounded-[2px]"
                  style={{ backgroundColor: CHART_RAMP[index % CHART_RAMP.length] }}
                />
                <span className="truncate text-[12.5px]">{entry.name}</span>
                <span className="font-mono text-[12px] text-muted-foreground">
                  {numberToCurrency(entry.value)}
                </span>
                <span className="w-[42px] text-right font-mono text-[11px] text-faint">
                  {entry.percent}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
