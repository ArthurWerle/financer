import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { KEY } from '@/queries/subcategories/useSubcategories'
import { useQueryClient } from '@tanstack/react-query'
import { addSubcategory } from '@/queries/subcategories/addSubcategory'
import { toast } from 'react-toastify'

type FormData = {
  Name: string
  Description: string
}

export const AddSubcategory = () => {
  const [formData, setFormData] = useState<FormData>({
    Name: '',
    Description: '',
  })
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    await addSubcategory({
      name: formData.Name,
      description: formData.Description,
    })
      .then(() => {
        queryClient.invalidateQueries({ queryKey: [KEY] })
        setFormData({ Name: '', Description: '' })
        setIsOpen(false)
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error creating subcategory'}`)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default">Add Subcategory</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Subcategory</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="subcategory-name">Name</Label>
              <Input
                id="subcategory-name"
                type="text"
                value={formData.Name}
                onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subcategory-description">Description</Label>
              <Input
                id="subcategory-description"
                value={formData.Description}
                onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Create'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
