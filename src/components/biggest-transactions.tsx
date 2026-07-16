import { useBiggestTransactions } from '../queries/transactions/useBiggestTransactions'
import { numberToCurrency } from '@/utils/number-to-currency'

export function BiggestTransactions() {
  const { data } = useBiggestTransactions()
  const transactions = data?.transactions || []
  const maxAmount = Math.max(1, ...transactions.map((transaction) => transaction.amount))

  return (
    <div className="rounded-[10px] border border-border bg-card p-5">
      <h2 className="mb-3 text-[14px] font-semibold">Biggest transactions</h2>
      <div className="flex flex-col gap-[9px]">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex flex-col gap-[3px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12.5px]">{transaction.description}</span>
              <span className="whitespace-nowrap font-mono text-[12px] text-muted-foreground">
                {numberToCurrency(transaction.amount)}
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-panel2">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(transaction.amount / maxAmount) * 100}%`,
                  backgroundColor: 'var(--c3)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
