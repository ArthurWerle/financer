"use client"

import { Card } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'Jan', income: 4000, expenses: 2400 },
  { name: 'Feb', income: 3000, expenses: 1398 },
  { name: 'Mar', income: 2000, expenses: 9800 },
  { name: 'Apr', income: 2780, expenses: 3908 },
  { name: 'May', income: 1890, expenses: 4800 },
  { name: 'Jun', income: 2390, expenses: 3800 },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Analytics</h1>
      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <h2 className="text-2xl font-semibold mb-4">Income vs Expenses</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="income" fill="#8884d8" />
            <Bar dataKey="expenses" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}

