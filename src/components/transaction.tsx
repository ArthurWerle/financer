import { motion } from 'framer-motion'
import {
  Transaction as TransactionType,
  TransactionV2,
} from '../types/transaction'
import { RecurringTransaction } from '../types/recurring-transaction'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { getLeftPayments } from '../utils/get-left-payments'
import { humanReadableDate } from '../utils/format-date'
import { Category } from '@/types/category'

type TransactionV1 = TransactionType & Partial<RecurringTransaction>
type TransactionProps = TransactionV2 | TransactionV1

function isTransactionV2(
  transaction: TransactionProps
): transaction is TransactionV2 {
  return 'type' in transaction
}

export function Transaction({
  transaction,
  categories,
  index,
}: {
  transaction: TransactionProps
  categories: Category[]
  index?: number
}) {
  const isV2 = isTransactionV2(transaction)
  const description = transaction.description
  const amount = transaction.amount
  const date = transaction.date
  const categoryName = isV2
    ? categories?.find((category) => category.ID === transaction.category_id)
        ?.Name
    : transaction.categoryName
  const endDate = isV2 ? transaction.end_date : transaction.endDate
  const frequency = transaction.frequency
  const isRecurringTransaction = isV2 ? transaction.is_recurring : !!frequency
  const type = isV2 ? transaction.type : transaction.typeName

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
            {date?.length > 0 && !endDate && (
              <p className="text-xs text-gray-500">
                {`${humanReadableDate(date)}`}
              </p>
            )}
            {isRecurringTransaction && frequency && (
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
