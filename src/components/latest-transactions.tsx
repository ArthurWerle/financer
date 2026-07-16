import Link from 'next/link'
import { useLatestTransactions } from '../queries/transactions/useLatestTransactions'
import { Transaction } from './transaction'
import { useCategories } from '../queries/categories/useCategories'

export function LatestTransactions() {
  const { data } = useLatestTransactions()
  const { data: categories = [] } = useCategories()

  const transactions = data?.transactions || []

  return (
    <div className="rounded-[10px] border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Latest transactions</h2>
        <Link
          href="/transactions"
          className="font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          View all →
        </Link>
      </div>
      <ul>
        {transactions?.map((transaction, index) => (
          <Transaction
            key={transaction.id}
            transaction={transaction}
            categories={categories}
            index={index}
          />
        ))}
      </ul>
    </div>
  )
}
