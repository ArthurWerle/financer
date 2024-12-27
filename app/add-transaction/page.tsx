'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCategories } from '../../src/queries/categories/useCategories'

export default function AddTransaction() {
  const [transactionType, setTransactionType] = useState('expense')
  const { data: categories } = useCategories()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Add Transaction</h1>
      <Card className="p-6 bg-[#181818] max-w-md mx-auto">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Transaction Type</label>
            <div className="flex space-x-4">
              <Button
                variant={transactionType === 'expense' ? 'default' : 'outline'}
                onClick={() => setTransactionType('expense')}
              >
                Expense
              </Button>
              <Button
                variant={transactionType === 'income' ? 'default' : 'outline'}
                onClick={() => setTransactionType('income')}
              >
                Income
              </Button>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <label className="block text-sm font-medium mb-2">Amount</label>
            <Input type="number" placeholder="Enter amount" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <label className="block text-sm font-medium mb-2">Description</label>
            <Input type="text" placeholder="Enter description" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.ID} value={String(category.ID)}>
                    {category.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <label className="block text-sm font-medium mb-2">Date</label>
            <Input type="date" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Button className="w-full">Add Transaction</Button>
          </motion.div>
        </form>
      </Card>
    </div>
  )
}

