import { QueryClient } from '@tanstack/react-query'

import { KEY as ALL_TRANSACTIONS_KEY } from './useTransactions'
import { KEY as TRANSACTION_KEY } from './useTransaction'
import { KEY as LATEST_TRANSACTIONS_KEY } from './useLatestTransactions'
import { KEY as BIGGEST_TRANSACTIONS_KEY } from './useBiggestTransactions'
import { KEY as MONTH_OVERVIEW_KEY } from './useMonthOverview'
import { KEY as RECURRING_EXPENSE_TOTAL_KEY } from './useRecurringExpenseTotal'
import { KEY as EXPENSE_COMPARISON_HISTORY_KEY } from './useExpenseComparsionHistory'
import { KEY as CATEGORY_COMPARISON_HISTORY_KEY } from './useCategoryComparisonHistory'
import { KEY as AVERAGE_BY_CATEGORY_KEY } from './useAverageByCategory'
import { KEY as CATEGORIES_MONTHLY_EXPENSE_KEY } from '../categories/useCategoriesMonthlyExpense'
import { KEY as SUBCATEGORIES_MONTHLY_EXPENSE_KEY } from '../subcategories/useSubcategoriesMonthlyExpense'
import { KEY as LOCATIONS_KEY } from '../locations/useLocations'

// Every query whose data changes when a transaction is created or edited.
// Deliberately leaves out /auth/me, /categories, /subcategories and the AI
// queries (/ai/chats, /ai/insights): a bare queryClient.invalidateQueries()
// refetched all of those on every new transaction.
const AFFECTED_KEYS = [
  ALL_TRANSACTIONS_KEY,
  TRANSACTION_KEY,
  LATEST_TRANSACTIONS_KEY,
  BIGGEST_TRANSACTIONS_KEY,
  MONTH_OVERVIEW_KEY,
  RECURRING_EXPENSE_TOTAL_KEY,
  EXPENSE_COMPARISON_HISTORY_KEY,
  CATEGORY_COMPARISON_HISTORY_KEY,
  AVERAGE_BY_CATEGORY_KEY,
  CATEGORIES_MONTHLY_EXPENSE_KEY,
  SUBCATEGORIES_MONTHLY_EXPENSE_KEY,
  LOCATIONS_KEY,
  // useAverage does not export a KEY constant.
  'types/average',
]

export const invalidateTransactionQueries = (queryClient: QueryClient) =>
  Promise.all(
    AFFECTED_KEYS.map((key) => queryClient.invalidateQueries({ queryKey: [key] }))
  )
