import { BFF_BASE_URL } from '@/constants'
import { TransactionResponse } from '@/types/transaction'
import api from '@/utils/api'
import { useQuery } from '@tanstack/react-query'
import { useCategories } from '@/queries/categories/useCategories'

export const KEY = '/recurring-expense-total'

// Sums the current month's recurring expenses. Recurring transactions active
// this month are returned by /transactions (currentMonth filter) carrying their
// monthly amount, matching the consumption basis used by the overview total.
// Categories excluded from calculations are skipped, as the overview does.
export const useRecurringExpenseTotal = () => {
  const { data: categories } = useCategories()
  const excludedCategoryIds = new Set(
    (categories ?? [])
      .filter((category) => category.exclude_from_calculations)
      .map((category) => category.id)
  )

  return useQuery({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<TransactionResponse>(`${BFF_BASE_URL}/transactions`, {
          params: {
            currentMonth: 'true',
            type: 'expense',
            limit: 1000,
            offset: 0,
          },
        })
        .then((res) => res.data),
    select: (data) =>
      data.transactions.reduce(
        (total, transaction) =>
          transaction.is_recurring &&
          !excludedCategoryIds.has(transaction.category_id)
            ? total + transaction.amount
            : total,
        0
      ),
    refetchOnWindowFocus: false,
  })
}
