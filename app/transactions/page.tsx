'use client'

import { Card } from '@/components/ui/card'
import { useTransactions } from '@/queries/transactions/useTransactions'
import { useFilters } from '@/hooks/useFilters'
import { Filters } from './components/filters'
import { useCategories } from '@/queries/categories/useCategories'
import { TransactionsTable } from './components/transactions-table'

export default function Transactions() {
  const { filters } = useFilters()

  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories()

  const { data, isLoading } = useTransactions({
    filters: {
      ...filters,
      category: filters.category ? filters.category.split(',') : undefined,
      query: filters.query,
      start_date: filters.startDate,
      end_date: filters.endDate,
      type: filters.type ?? 'expense',
    },
  })

  const transactions = data?.transactions || []
  const count = data?.count ?? 0
  const sum = data?.sum ?? 0

  const formattedSum = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(sum)

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <Filters />
        {isLoading || isLoadingCategories ? (
          '...Loading'
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-3">
              Showing {count} transaction{count !== 1 ? 's' : ''} · Total:{' '}
              {formattedSum}
            </p>
            <TransactionsTable
              transactions={transactions}
              categories={categories}
            />
          </>
        )}
      </Card>
    </div>
  )
}
