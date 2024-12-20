"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowUp, ArrowDown } from 'lucide-react'

const monthlyData = [
  { month: "Jan", currentMonth: 9500, lastMonth: 9000 },
  { month: "Feb", currentMonth: 11200, lastMonth: 10500 },
  { month: "Mar", currentMonth: 10800, lastMonth: 10200 },
  { month: "Apr", currentMonth: 9800, lastMonth: 9600 },
  { month: "May", currentMonth: 10200, lastMonth: 9800 },
  { month: "Jun", currentMonth: 9700, lastMonth: 9400 },
  { month: "Jul", currentMonth: 16281, lastMonth: 15000 },
  { month: "Aug", currentMonth: 15000, lastMonth: 14500 },
  { month: "Sep", currentMonth: 13500, lastMonth: 13000 },
  { month: "Oct", currentMonth: 14200, lastMonth: 13800 },
  { month: "Nov", currentMonth: 15800, lastMonth: 15200 },
  { month: "Dec", currentMonth: 16000, lastMonth: 15500 },
]

const expenseCategories = [
  { name: "Food & Health", percentage: 63, amount: 985.90, color: "red" },
  { name: "Transportation", percentage: 56, amount: 856.20, color: "green" },
  { name: "Shopping", percentage: 48, amount: 742.50, color: "blue" },
  { name: "Entertainment", percentage: 46, amount: 698.30, color: "purple" },
  { name: "Restaurants", percentage: 46, amount: 698.30, color: "teal" },
  { name: "Pets", percentage: 46, amount: 698.30, color: "olive" },
]

export function Statistics() {
  const [period, setPeriod] = useState("monthly")

  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <Tabs defaultValue="monthly" className="w-full" onValueChange={setPeriod}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Financial Overview</h2>
            <TabsList className="grid grid-cols-3 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="daily" className="px-4 py-2 text-sm">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="px-4 py-2 text-sm">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="px-4 py-2 text-sm">Monthly</TabsTrigger>
            </TabsList>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <TabsContent value="daily" className="mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Daily Income</p>
                <p className="text-3xl font-bold text-gray-900">$542.71</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  7.2% from yesterday
                </p>
              </div>
            </TabsContent>
            <TabsContent value="daily" className="mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Daily Expenses</p>
                <p className="text-3xl font-bold text-gray-900">$221.40</p>
                <p className="text-sm text-red-600 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" />
                  2.5% from yesterday
                </p>
              </div>
            </TabsContent>
            <TabsContent value="weekly" className="mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Weekly Income</p>
                <p className="text-3xl font-bold text-gray-900">$3,799.00</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  5.3% from last week
                </p>
              </div>
            </TabsContent>
            <TabsContent value="weekly" className="mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Weekly Expenses</p>
                <p className="text-3xl font-bold text-gray-900">$1,549.80</p>
                <p className="text-sm text-red-600 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" />
                  1.8% from last week
                </p>
              </div>
            </TabsContent>
            <TabsContent value="monthly" className="mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Monthly Income</p>
                <p className="text-3xl font-bold text-gray-900">$16,281.48</p>
                <p className="text-sm text-green-600 flex items-center">
                  <ArrowUp className="w-4 h-4 mr-1" />
                  9.8% from last month
                </p>
              </div>
            </TabsContent>
            <TabsContent value="monthly" className="mt-0">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
                <p className="text-3xl font-bold text-gray-900">$6,638.72</p>
                <p className="text-sm text-red-600 flex items-center">
                  <ArrowDown className="w-4 h-4 mr-1" />
                  8.6% from last month
                </p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </Card>

      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Income Comparison</h3>
        <ChartContainer
          config={{
            currentMonth: {
              label: "Current Month",
              color: "hsl(var(--chart-1))",
            },
            lastMonth: {
              label: "Last Month",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-[300px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="currentMonth"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
                stroke="var(--color-currentMonth)"
              />
              <Line
                type="monotone"
                dataKey="lastMonth"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 8 }}
                stroke="var(--color-lastMonth)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </Card>

      <Card className="p-6 bg-white shadow-lg rounded-2xl">
        <h3 className="text-xl font-semibold text-gray-800 mb-6">Expense Categories</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            {expenseCategories.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{category.name}</span>
                  <span className="font-bold text-gray-900">${category.amount.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${category.percentage}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">From</p>
              <p className="text-3xl font-bold text-gray-900">$6,638.72</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

