import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { KEY } from '@/queries/categories/useCategories'
import { useQueryClient } from '@tanstack/react-query'
import { addCategory } from '../queries/categories/addCategory'

type FormData = {
  Name: string
  Description: string
  ExcludeFromCalculations: boolean
}

export const AddCategory = () => {
  const [formData, setFormData] = useState<FormData>({
    Name: '',
    Description: '',
    ExcludeFromCalculations: false,
  })

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: any) => {
    setIsLoading(true)

    await addCategory({
      name: formData.Name,
      description: formData.Description,
      exclude_from_calculations: formData.ExcludeFromCalculations,
    })
      .catch((error) => alert(error))
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: KEY })
        setIsLoading(false)
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-[30px] rounded-[7px] px-3 text-[12.5px] font-medium">
          <Plus size={12} />
          Add category
        </Button>
      </DialogTrigger>
      <DialogContent>
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

            <div className="flex items-center justify-between gap-4 py-0.5">
              <div className="grid gap-0.5">
                <Label htmlFor="exclude-from-calculations">Exclude from calculations</Label>
                <p className="text-[11.5px] text-faint">
                  Leaves this category out of averages, totals and reports.
                </p>
              </div>
              <Switch
                id="exclude-from-calculations"
                checked={formData.ExcludeFromCalculations}
                onCheckedChange={(checked) => setFormData({ ...formData, ExcludeFromCalculations: checked })}
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