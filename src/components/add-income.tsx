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
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useCategories } from '../queries/categories/useCategories'
import {
  addTransactionV2,
  PostTransactionTypeV2,
} from '../queries/transactions/addTransaction'
import { useQueryClient } from '@tanstack/react-query'
import { RecurringTransaction } from '../types/recurring-transaction'
import { toast } from 'react-toastify'
import { TransactionType } from '@/enums/enums'
import { TransactionV2 } from '@/types/transaction'

type FormData = Partial<
  Omit<TransactionV2, 'id' | 'type' | 'created_at' | 'updated_at' | 'date'> & {
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

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: categories, isLoading: isLoadingCategories } = useCategories()

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

  const handleSubmit = async (e: any) => {
    setIsLoading(true)
    e.preventDefault()

    const transactionV2: PostTransactionTypeV2 = {
      amount: formData.amount ?? 0,
      category_id: formData.category_id ?? 0,
      description: formData.description ?? '',
      type: TransactionType.Income,
      date: formData.date?.toISOString() ?? '',
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
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          id="add-income-button"
          onClick={() => setIsDialogOpen(true)}
        >
          New Income
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: Number(e.target.value) })
                }
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: Number(value) })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="" disabled>
                      Loading categories...
                    </SelectItem>
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

            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date
                      ? format(formData.date, 'PPP')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData({ ...formData, date })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || !formValidation.isValid}
          >
            {isLoading ? 'Loading...' : 'Create'}
          </Button>
          {!formValidation.isValid && (
            <ul>
              {formValidation.invalidFields.map((invalidField) => (
                <li key={invalidField} className="text-red-500 text-[11px]">
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
