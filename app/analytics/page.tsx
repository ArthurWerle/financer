'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useCategories } from '@/queries/categories/useCategories'
import { useAverage } from '@/queries/categories/useAverage'

export default function Analytics() {
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories()

  const { data: averageByCategory, isLoading: isLoadingAverages } = useAverage()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Analytics</h1>
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        {isLoadingCategories || isLoadingAverages ? (
          '...Loading'
        ) : (
          <div className="space-y-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.Name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">{category.Name}</p>
                    <p className="text-sm text-gray-500">
                      {category.Description}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium">Average spend</p>
                    <p className="text-sm text-gray-500">
                      {averageByCategory?.find(
                        (average) => average.CategoryID === category.ID
                      )?.Average || 'Average not found'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
