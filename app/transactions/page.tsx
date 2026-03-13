'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useTransactions } from '@/queries/transactions/useTransactions'
import { useFilters } from '@/hooks/useFilters'
import { Filters } from './components/filters'
import { useCategories } from '@/queries/categories/useCategories'
import { TransactionsTable } from './components/transactions-table'

const LIMIT = 50

export default function Transactions() {
  const { filters } = useFilters()
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    setOffset(0)
  }, [filters])

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
    limit: LIMIT,
    offset,
  })

  const transactions = data?.transactions || []
  const total = data?.total ?? 0
  const sum = data?.sum ?? 0
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const currentPage = Math.floor(offset / LIMIT) + 1

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
              Showing {transactions.length} of {total} transaction{total !== 1 ? 's' : ''} · Total:{' '}
              {formattedSum}
            </p>
            <TransactionsTable
              transactions={transactions}
              categories={categories}
            />
            <div className="flex items-center justify-center gap-4 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset - LIMIT)}
                disabled={offset === 0}
              >
                &lt; Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setOffset(offset + LIMIT)}
                disabled={offset + LIMIT >= total}
              >
                Next &gt;
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
