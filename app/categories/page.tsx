'use client'

import { motion } from 'framer-motion'
import { Card } from "@/components/ui/card"
// import { Progress } from "@/components/ui/progress"
import { useCategories } from '@/src/queries/categories/useCategories'
import { AddCategory } from '@/src/components/add-category'

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Categories</h1>
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <div className='flex justify-between items-center mb-6'>
          <h2 className="text-2xl font-bold mb-6">Expense Categories</h2>
          <AddCategory />
        </div>
        {isLoading ? "...Loading" : (
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
                    <p className="text-sm text-gray-500">{category.Description}</p>
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

