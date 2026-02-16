'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useCategories } from '@/queries/categories/useCategories'
import { AddCategory } from '@/components/add-category'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { deleteCategory } from '@/queries/categories/deleteCategory'
import {
  updateCategory,
  UpdateCategoryData,
} from '@/queries/categories/updateCategory'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Category } from '@/types/category'

function CategoryItem({ category, index }: { category: Category; index: number }) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [editData, setEditData] = useState({
    name: category.name,
    description: category.description,
    color: category.color,
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteCategory(category.id)
      .then(() => {
        toast.success('Category deleted')
        queryClient.invalidateQueries()
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error deleting category'}`)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const data: UpdateCategoryData = {
      name: editData.name,
      description: editData.description,
      color: editData.color,
    }

    await updateCategory(category.id, data)
      .then(() => {
        toast.success('Category updated')
        queryClient.invalidateQueries()
        setIsEditOpen(false)
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error updating category'}`)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditOpen = () => {
    setEditData({
      name: category.name,
      description: category.description,
      color: category.color,
    })
    setIsEditOpen(true)
  }

  return (
    <>
      <motion.div
        key={category.id}
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isDeleting}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditOpen}>
                <Pencil className="h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`name-${category.id}`}>Name</Label>
                <Input
                  id={`name-${category.id}`}
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`description-${category.id}`}>
                  Description
                </Label>
                <Input
                  id={`description-${category.id}`}
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`color-${category.id}`}>Color</Label>
                <Input
                  id={`color-${category.id}`}
                  value={editData.color}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      color: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function Categories() {
  const { data: categories = [], isLoading } = useCategories()

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8">Categories</h1>
      <Card className="p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-6">Expense Categories</h2>
          <AddCategory />
        </div>
        {isLoading ? (
          '...Loading'
        ) : (
          <div className="space-y-6">
            {categories.map((category, index) => (
              <CategoryItem
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
