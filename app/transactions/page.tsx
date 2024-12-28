'use client'

import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { useTransactions } from '@/src/queries/transactions/useTransactions'

export default function Transactions() {
  const { data: transactions = [], isLoading } = useTransactions()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Transactions</h1>
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        {isLoading ? "...Loading" : (
          <div className="space-y-6">
            {transactions.map((transaction, index) => (
              <motion.div
                key={transaction.id + index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{transaction.description}</span>
                  <span className="font-medium">{
                    new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                      }).format(transaction.amount)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

