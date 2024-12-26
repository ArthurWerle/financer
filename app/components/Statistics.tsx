"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useMonthOverview } from "../queries/transactions/useMonthOverview"
import { Skeleton } from "@/components/ui/skeleton"

export function MonthlyTab() {
  const { data: monthOverview, isLoading } = useMonthOverview()

  const { income, expense } = monthOverview || {}

   if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <TabsContent value="monthly" className="mt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Monthly Income</p>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(income?.currentMonth ?? 0)}
          </p>
          {(income?.percentageVariation ?? 0) > 0 && (
            <p className={`text-sm ${income?.percentageVariation || 0 >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}>
              <ArrowUp className="w-4 h-4 mr-1" />
              {income?.percentageVariation}% from last month
            </p>
          )}
        </div>
      </TabsContent>
      <TabsContent value="monthly" className="mt-0">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-500">Monthly Expenses</p>
          <p className="text-3xl font-bold text-gray-900">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(expense?.currentMonth ?? 0)}
          </p>
          {(expense?.percentageVariation ?? 0) > 0 && (
          <p className={`text-sm ${expense?.percentageVariation || 0 >= 0 ? "text-red-600" : "text-green-600"} flex items-center`}>
            <ArrowDown className="w-4 h-4 mr-1" />
            {expense?.percentageVariation}% from last month
          </p>
          )}
        </div>
      </TabsContent>
    </div>
  )
}

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
            <MonthlyTab />
          </div>
        </Tabs>
      </Card>

      <h1>IncomeComparsionChart</h1> 

      <h1>expense categories</h1>
    </div>
  )
}

