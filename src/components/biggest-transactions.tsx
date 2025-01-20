import { useBiggestTransactions } from "../queries/transactions/useBiggestTransactions"
import { Transaction } from "./transaction"

export function BiggestTransactions() {
  const { data } = useBiggestTransactions()
  
  return (
    <div className="w-[350px] mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">Biggest transactions</h3>
      <ul>
        {data?.map((transaction, index) => (
          <Transaction key={transaction.amount + index + transaction.amount} transaction={transaction} index={index} />
        ))}
      </ul>
    </div>
  )
}