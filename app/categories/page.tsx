'use client'

import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const categories = [
  { name: 'Food & Dining', amount: 850, color: 'bg-[#1DB954]' },
  { name: 'Transportation', amount: 450, color: 'bg-[#1ED760]' },
  { name: 'Utilities', amount: 350, color: 'bg-[#535353]' },
  { name: 'Entertainment', amount: 250, color: 'bg-[#B3B3B3]' },
  { name: 'Shopping', amount: 600, color: 'bg-[#FF7EB6]' },
]

const totalExpenses = categories.reduce((sum, category) => sum + category.amount, 0)

export default function Categories() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Categories</h1>
      <Card className="p-6 bg-[#181818]">
        <h2 className="text-2xl font-bold mb-6">Expense Categories</h2>
        <div className="space-y-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">{category.name}</span>
                <span className="font-bold">${category.amount}</span>
              </div>
              <Progress
                value={(category.amount / totalExpenses) * 100}
                className={`h-2 ${category.color}`}
              />
            </motion.div>
          ))}
        </div>
      </Card>
    </div>
  )
}

