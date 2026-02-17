import { useCategories } from '@/queries/categories/useCategories'
import { useBiggestTransactions } from '../queries/transactions/useBiggestTransactions'
import { Transaction } from './transaction'

export function BiggestTransactions() {
  const { data } = useBiggestTransactions()
  const { data: categories = [] } = useCategories()

  const transactions = data?.transactions || []

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Biggest transactions
      </h3>
      <ul>
        {transactions?.map((transaction, index) => (
          <Transaction
            key={transaction.amount + index + transaction.amount}
            categories={categories}
            transaction={transaction}
            index={index}
          />
        ))}
      </ul>
    </div>
  )
}
