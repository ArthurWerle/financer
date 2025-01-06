"use client"

import React from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useMonthOverview } from "../queries/transactions/useMonthOverview"
import { Skeleton } from "@/components/ui/skeleton"
import { useWeekOverview } from "../queries/transactions/useWeekOverview"
import { ExpenseComparsionHistory } from "./expense-comparsion-history"
import { ExpenseCategories } from "./expense-categories"

export function MonthlyTab() {
  const { data: monthOverview, isLoading } = useMonthOverview()

  const { income, expense } = monthOverview || {}

   if (isLoading) {
    return (
      <div className="flex gap-12">
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
    <div className="flex gap-12">
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
    </div>
  )
}

export function WeeklyTab() {
  const { data: weekOverview, isLoading } = useWeekOverview()

  const { income, expense } = weekOverview || {}

   if (isLoading) {
    return (
      <div className="flex gap-12">
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
    <div className="flex gap-12">
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Weekly Income</p>
        <p className="text-3xl font-bold text-gray-900">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(income?.currentWeek ?? 0)}
        </p>
        {(income?.percentageVariation ?? 0) > 0 && (
          <p className={`text-sm ${income?.percentageVariation || 0 >= 0 ? "text-green-600" : "text-red-600"} flex items-center`}>
            <ArrowUp className="w-4 h-4 mr-1" />
            {income?.percentageVariation}% from last week
          </p>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-500">Weekly Expenses</p>
        <p className="text-3xl font-bold text-gray-900">
          {new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(expense?.currentWeek ?? 0)}
        </p>
        {(expense?.percentageVariation ?? 0) > 0 && (
        <p className={`text-sm ${expense?.percentageVariation || 0 >= 0 ? "text-red-600" : "text-green-600"} flex items-center`}>
          <ArrowDown className="w-4 h-4 mr-1" />
          {expense?.percentageVariation}% from last week
        </p>
        )}
      </div>
    </div>
  )
}

export function Statistics() {
  return (
    <div className="space-y-8">
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Financial Overview</h2>
            <TabsList className="grid grid-cols-2 bg-gray-100 p-1 rounded-lg">
              <TabsTrigger value="weekly" className="px-2 py-1 text-sm">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="px-2 py-1 text-sm">Monthly</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="weekly" className="mt-0">
            <WeeklyTab />
          </TabsContent>
          <TabsContent value="monthly" className="mt-0">
            <MonthlyTab />
          </TabsContent>
        </Tabs>
      </Card>
      <ExpenseComparsionHistory />
      <ExpenseCategories />
    </div>
  )
}

