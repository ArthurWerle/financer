'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/page-header'
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
  const totalPages = Math.max(1, Math.ceil(total / LIMIT))
  const currentPage = Math.floor(offset / LIMIT) + 1

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Transactions"
        subtitle={`${total} transaction${total !== 1 ? 's' : ''} this month`}
      />
      <Card className="rounded-[10px] border-border p-0 shadow-none">
        <div className="px-4 pt-3.5 sm:px-5">
          <Filters />
        </div>
        {isLoading || isLoadingCategories ? (
          <div className="space-y-3 p-4 sm:p-5">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <p className="px-4 pb-1 pt-2.5 font-mono text-[11px] text-faint sm:px-5">
              Showing {transactions.length} of {total} transaction
              {total !== 1 ? 's' : ''}
            </p>
            <div className="px-4 sm:px-5">
              <TransactionsTable
                transactions={transactions}
                categories={categories}
              />
            </div>
            <div className="flex items-center justify-center gap-3.5 p-3.5">
              <Button
                variant="outline"
                onClick={() => setOffset(offset - LIMIT)}
                disabled={offset === 0}
                className="h-7 rounded-md px-2.5 font-mono text-xs text-muted-foreground"
              >
                ← Prev
              </Button>
              <span className="font-mono text-[11.5px] text-muted-foreground">
                Page {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setOffset(offset + LIMIT)}
                disabled={offset + LIMIT >= total}
                className="h-7 rounded-md px-2.5 font-mono text-xs text-muted-foreground"
              >
                Next →
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
