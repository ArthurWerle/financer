import { useLatestTransactions } from '../queries/transactions/useLatestTransactions'
import { Transaction } from './transaction'
import { useCategories } from '../queries/categories/useCategories'

export function LatestTransactions() {
  const { data } = useLatestTransactions()
  const { data: categories = [] } = useCategories()

  const transactions = data?.transactions || []

  return (
    <div className="w-[350px] mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Latest transactions
      </h3>
      <ul>
        {transactions?.map((transaction, index) => (
          <Transaction
            key={transaction.amount + index + transaction.amount}
            transaction={transaction}
            categories={categories}
            index={index}
          />
        ))}
      </ul>
    </div>
  )
}
