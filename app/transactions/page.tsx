'use client'

import { Card } from "@/components/ui/card"
import { useTransactions } from '@/src/queries/transactions/useTransactions'
import { Transaction } from '@/src/components/transaction'

export default function Transactions() {
  const { data: transactions = [], isLoading } = useTransactions()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        {isLoading ? "...Loading" : (
          <div className="space-y-6">
            {transactions.map((transaction, index) => (
              <Transaction key={transaction.id + index} transaction={transaction} index={index} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

