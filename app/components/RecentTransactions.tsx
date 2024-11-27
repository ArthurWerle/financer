'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { ShoppingCart, ArrowDownRight, Coffee, Smartphone } from 'lucide-react'
import { TransactionFilter, FilterState } from './TransactionFilter'

interface Transaction {
  id: number;
  name: string;
  amount: number;
  category: string;
  icon: React.ElementType;
  date: Date;
  type: 'income' | 'expense';
}

const allTransactions: Transaction[] = [
  { id: 1, name: 'Grocery Shopping', amount: -85.50, category: 'Food', icon: ShoppingCart, date: new Date('2023-05-01'), type: 'expense' },
  { id: 2, name: 'Salary Deposit', amount: 3500.00, category: 'Income', icon: ArrowDownRight, date: new Date('2023-05-05'), type: 'income' },
  { id: 3, name: 'Coffee Shop', amount: -4.50, category: 'Food & Drink', icon: Coffee, date: new Date('2023-05-10'), type: 'expense' },
  { id: 4, name: 'Phone Bill', amount: -50.00, category: 'Utilities', icon: Smartphone, date: new Date('2023-05-15'), type: 'expense' },
]

const RecentTransactions = () => {
  const [filteredTransactions, setFilteredTransactions] = useState(allTransactions)

  const handleFilterChange = (filters: FilterState) => {
    const filtered = allTransactions.filter(transaction => {
      const dateInRange = filters.dateRange
        ? transaction.date >= filters.dateRange.from && transaction.date <= filters.dateRange.to
        : true
      const categoryMatch = filters.category === 'all' || transaction.category.toLowerCase() === filters.category
      const typeMatch = filters.type === 'all' || transaction.type === filters.type
      return dateInRange && categoryMatch && typeMatch
    })
    setFilteredTransactions(filtered)
  }

  return (
    <Card className="p-6 bg-white shadow-md">
      <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
      <TransactionFilter onFilterChange={handleFilterChange} />
      <AnimatePresence>
        {filteredTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4"
          >
            <div className="flex items-center space-x-4">
              <div className={`p-2 rounded-full ${transaction.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {React.createElement(transaction.icon, { size: 20 })}
              </div>
              <div>
                <p className="font-medium">{transaction.name}</p>
                <p className="text-sm text-gray-500">{transaction.category}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {transaction.amount > 0 ? '+' : ''}{transaction.amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">{transaction.date.toLocaleDateString()}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </Card>
  )
}

export default RecentTransactions

