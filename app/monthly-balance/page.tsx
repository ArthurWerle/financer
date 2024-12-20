'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from 'lucide-react'

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function MonthlyBalance() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())

  const prevMonth = () => setCurrentMonth((prev) => (prev === 0 ? 11 : prev - 1))
  const nextMonth = () => setCurrentMonth((prev) => (prev === 11 ? 0 : prev + 1))

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Monthly Balance</h1>
      <Card className="p-6 bg-[#181818]">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={prevMonth}>
            <ArrowLeft size={20} />
          </Button>
          <h2 className="text-2xl font-bold">{months[currentMonth]}</h2>
          <Button variant="outline" onClick={nextMonth}>
            <ArrowRight size={20} />
          </Button>
        </div>
        <motion.div
          key={currentMonth}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          <div className="flex justify-between">
            <p className="text-lg">Total Income:</p>
            <p className="text-lg font-bold text-green-500">$5,200.00</p>
          </div>
          <div className="flex justify-between">
            <p className="text-lg">Total Expenses:</p>
            <p className="text-lg font-bold text-red-500">$3,850.00</p>
          </div>
          <div className="flex justify-between">
            <p className="text-lg">Net Balance:</p>
            <p className="text-lg font-bold text-blue-500">$1,350.00</p>
          </div>
        </motion.div>
        <Button className="w-full mt-6">Reset Month Balance</Button>
      </Card>
    </div>
  )
}

