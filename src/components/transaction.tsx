import { motion } from "framer-motion"
import { Transaction as TransactionType } from "../types/transaction"
import { RecurringTransaction } from "../types/recurring-transaction"
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { getLeftPayments } from "../utils/get-left-payments"

type TransactionProps = TransactionType & RecurringTransaction

export function Transaction({  transaction, index }: { transaction: TransactionProps, index?: number }) {
  const { description, categoryName, amount, endDate, frequency } = transaction
  const isRecurringTransaction = !!endDate

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
          <p className="text-sm text-gray-500">{categoryName}</p>
        </div>
        <div>
          <div className='flex gap-2'>
            {
              transaction.typeName === 'expense' ? (
                <ArrowUpRight className="h-5 w-5 text-red-400"/>
              ) : (
                <ArrowDownLeft className="h-5 w-5 text-green-400" />
              )
            }
            <span className="font-medium">{
              new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(amount)}
            </span>
          </div>
          {
            isRecurringTransaction && (
              <p className="text-sm text-gray-500">{
                getLeftPayments(new Date(endDate), frequency)
              }</p>
            )
          }
        </div>
      </div>
    </motion.div>
  )
}