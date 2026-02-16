'use client'

import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useCategories } from '@/queries/categories/useCategories'
export default function Analytics() {
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategories()
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Analytics</h1>
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        {isLoadingCategories ? (
          '...Loading'
        ) : (
          <div className="space-y-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">
                      {category.description}
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
