'use client'

import { AverageByCategoryChart } from '@/components/average-by-category-chart'
import { Card } from '@/components/ui/card'

export default function Analytics() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Analytics</h1>
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <AverageByCategoryChart />
      </Card>
    </div>
  )
}
