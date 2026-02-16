import { motion } from 'framer-motion'
import { TransactionV2 } from '../types/transaction'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { getLeftPayments } from '../utils/get-left-payments'
import { humanReadableDate } from '../utils/format-date'
import { Category } from '@/types/category'

type TransactionProps = TransactionV2

export function Transaction({
  transaction,
  categories,
  index,
}: {
  transaction: TransactionProps
  categories: Category[]
  index?: number
}) {
  const description = transaction.description
  const amount = transaction.amount
  const date = transaction.date
  const categoryName = categories?.find(
    (category) => category.id === transaction.category_id
  )?.name
  const endDate = transaction.end_date
  const frequency = transaction.frequency
  const isRecurringTransaction = transaction.is_recurring
  const type = transaction.type

  return (
    <motion.div
      key={transaction.id + (index || amount)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: (index || 1) * 0.1 }}
    >
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="font-medium">{description}</p>
          {categoryName && (
            <p className="text-sm text-gray-500">{categoryName}</p>
          )}
        </div>
        <div>
          <div className="flex gap-2 justify-end">
            {type === 'expense' ? (
              <ArrowUpRight className="h-5 w-5 text-red-400" />
            ) : (
              <ArrowDownLeft className="h-5 w-5 text-green-400" />
            )}
            <span className="font-medium">
              {new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(amount)}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            {!isRecurringTransaction && (
              <p className="text-xs text-gray-500">
                {`${humanReadableDate(date)}`}
              </p>
            )}
            {isRecurringTransaction && (
              <p className="text-sm text-gray-500">
                {getLeftPayments(
                  endDate,
                  frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
