import { useMemo, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCategories } from '../queries/categories/useCategories'
import { useSubcategories } from '../queries/subcategories/useSubcategories'
import {
  addTransactionV2,
  PostTransactionTypeV2,
} from '../queries/transactions/addTransaction'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { TransactionType } from '@/enums/enums'
import { Transaction } from '@/types/transaction'
import { LocationCombobox } from '@/components/ui/location-combobox'
import { ArrowDownLeft } from 'lucide-react'

type FormData = Partial<
  Omit<Transaction, 'id' | 'type' | 'created_at' | 'updated_at' | 'date'> & {
    date: Date
    startDate: Date
  }
>

export const AddIncome = () => {
  const today = new Date()
  const [formData, setFormData] = useState<FormData>({
    amount: undefined,
    category_id: undefined,
    description: '',
    date: today,
  })

  const [location, setLocation] = useState('')
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: subcategories, isLoading: isLoadingSubcategories } = useSubcategories()

  const formValidation = useMemo(() => {
    let validation = {
      isValid: true,
      invalidFields: [] as string[],
    }

    if (!formData.amount || !formData.category_id || !formData.description) {
      validation = {
        ...validation,
        isValid: false,
      }

      if (!formData.amount) {
        validation = {
          ...validation,
          invalidFields: ['Amount'],
        }
      }

      if (!formData.category_id) {
        validation = {
          ...validation,
          invalidFields: [...validation.invalidFields, 'Category'],
        }
      }

      if (!formData.description) {
        validation = {
          ...validation,
          invalidFields: [...validation.invalidFields, 'Description'],
        }
      }
    }

    return validation
  }, [formData.amount, formData.category_id, formData.description])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const transactionV2: PostTransactionTypeV2 = {
      amount: formData.amount ?? 0,
      category_id: formData.category_id ?? 0,
      subcategory_id: formData.subcategory_id,
      description: formData.description ?? '',
      type: TransactionType.Income,
      date: formData.date?.toISOString() ?? '',
      location: location.trim() || undefined,
    }

    await addTransactionV2(transactionV2)
      .catch((error) => {
        console.log({ error })
        toast.error(
          `ERROR: ${error?.message || 'Error creating transaction V2'}`,
          {
            position: 'top-right',
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: 'colored',
          }
        )
      })
      .finally(() => {
        queryClient.invalidateQueries()
        setIsLoading(false)
        setIsDialogOpen(false)
      })
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        if (open) {
          setFormData({
            amount: undefined,
            category_id: undefined,
            subcategory_id: undefined,
            description: '',
            date: new Date(),
          })
          setLocation('')
        }
        setIsDialogOpen(open)
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          id="add-income-button"
          onClick={() => setIsDialogOpen(true)}
          className="h-8 rounded-[7px] px-3 text-[12.5px] font-medium"
        >
          <ArrowDownLeft size={13} className="text-green" />
          New income
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New income</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-3.5">
            <div className="grid gap-1.5">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                className="font-mono"
                value={formData.amount ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="grid gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Select
                  onValueChange={(value) =>
                    setFormData({ ...formData, category_id: Number(value) })
                  }
                  required
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select…" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoadingCategories ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Loading categories...
                      </div>
                    ) : (
                      categories?.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label>Date</Label>
                <Input
                  type="date"
                  className="font-mono text-[12.5px]"
                  value={formData.date ? format(formData.date, 'yyyy-MM-dd') : ''}
                  onChange={(e) => {
                    const date = new Date(e.target.value + 'T00:00:00')
                    if (!isNaN(date.getTime())) {
                      setFormData({ ...formData, date })
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="subcategory">Subcategory</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, subcategory_id: Number(value) })
                }
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Select subcategory (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingSubcategories ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Loading subcategories...
                    </div>
                  ) : (
                    subcategories?.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                        {subcategory.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="What was it?"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="location">Where? (optional)</Label>
              <LocationCombobox
                id="location"
                value={location}
                onChange={setLocation}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="mt-1 h-9 w-full rounded-[7px] text-[13px] font-semibold"
            disabled={isLoading || !formValidation.isValid}
          >
            {isLoading ? 'Loading...' : 'Create'}
          </Button>
          {!formValidation.isValid && (
            <ul>
              {formValidation.invalidFields.map((invalidField) => (
                <li key={invalidField} className="text-[11px] text-destructive">
                  Field &quot;{invalidField}&quot; is missing
                </li>
              ))}
            </ul>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
