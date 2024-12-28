import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { KEY } from '@/src/queries/categories/useCategories'
import { useQueryClient } from '@tanstack/react-query'
import { addCategory } from '../queries/categories/addCategory'

type FormData = {
  Name: string
  Description: string
}

export const AddCategory = () => {
  const [formData, setFormData] = useState<FormData>({
    Name: '',
    Description: '',
  })

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    await addCategory(formData)
      .catch((error) => console.error(error))
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: KEY })
        setIsLoading(false)
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Add Category</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                required
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}