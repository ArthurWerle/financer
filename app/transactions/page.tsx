'use client'

import { Card } from "@/components/ui/card"
import { useTransactions } from '@/queries/transactions/useTransactions'
import { Transaction } from '@/components/transaction'
import { useFilters } from "@/hooks/useFilters"
import { Filters } from "./components/filters"


export default function Transactions() {
  const { filters } = useFilters()
  
  const { data: transactions = [], isLoading } = useTransactions({
    filters: {
      ...filters,
      category: filters.category ? filters.category.split(',') : undefined
    }
  })

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <Filters />
        {isLoading ? "...Loading" : (
          <div className="space-y-6">
            {transactions.map((transaction, index) => (
              <Transaction key={`${transaction.id}-${index}-${transaction.amount}`} transaction={transaction} index={index} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

