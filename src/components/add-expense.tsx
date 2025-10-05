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
import { useTypes } from '../queries/types/useTypes'
import { addTransaction } from '../queries/transactions/addTransaction'
import { KEY as MONTH_OVERVIEW_QUERY_KEY } from '@/queries/transactions/useMonthOverview'
import { KEY as EXPENSE_COMPARSION_HISTORY_QUERY_KEY } from '@/queries/transactions/useExpenseComparsionHistory'
import { KEY as TRANSACTIONS_QUERY_KEY } from '@/queries/transactions/useTransactions'
import { KEY as CATEGORIES_MONTHLY_EXPENSE_QUERY_KEY } from '@/queries/categories/useCategoriesMonthlyExpense'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addDate } from '../utils/add-date'

type FormData = {
  amount: number | undefined
  categoryId: number | undefined
  typeId: number | undefined
  description: string
  date: Date
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | undefined
  startDate: Date
  installments: number | undefined
  endDate: Date | undefined
  lastOccurrence: string | undefined
}

export const AddExpense = () => {
  const today = new Date()
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    amount: undefined,
    categoryId: undefined,
    typeId: undefined,
    description: '',
    date: today,
    frequency: undefined,
    startDate: today,
    installments: undefined,
    endDate: undefined,
    lastOccurrence: undefined,
  })

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: types, isLoading: isLoadingTypes } = useTypes()
  const expenseTypeId = types?.find((type) => type.Name === 'expense')?.ID

  const formValidation = useMemo(() => {
    let validation = {
      isValid: true,
      invalidFields: [] as string[],
    }

    if (!formData.amount || !formData.categoryId || !formData.description) {
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

      if (!formData.categoryId) {
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
  }, [formData.amount, formData.categoryId, formData.description])

  const handleSubmit = async (e: any) => {
    setIsLoading(true)
    e.preventDefault()

    const endDate = formData.installments
      ? addDate(formData.date, formData.installments)
      : undefined

    const formDataWithTypeIdAndEndDate = {
      amount: formData.amount,
      categoryId: formData.categoryId,
      description: formData.description,
      typeId: expenseTypeId,
      date: formData.date.toISOString(),
      frequency: formData.frequency,
      startDate: formData.startDate.toISOString(),
      endDate: endDate?.toISOString(),
    }

    await addTransaction(formDataWithTypeIdAndEndDate)
      .catch((error) => {
        console.log({ error })
        toast.error(
          `ERROR: ${error?.message || 'Error creating transaction'}`,
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
        queryClient.invalidateQueries({ queryKey: MONTH_OVERVIEW_QUERY_KEY })
        queryClient.invalidateQueries({
          queryKey: EXPENSE_COMPARSION_HISTORY_QUERY_KEY,
        })
        queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
        queryClient.invalidateQueries({
          queryKey: CATEGORIES_MONTHLY_EXPENSE_QUERY_KEY,
        })
        setIsLoading(false)
        setIsDialogOpen(false)
      })
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          id="add-expense-button"
          onClick={() => setIsDialogOpen(true)}
        >
          New Expense
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
                  setFormData({ ...formData, categoryId: Number(value) })
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
                      <SelectItem key={category.ID} value={String(category.ID)}>
                        {category.Name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Date</Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
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
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date })
                        setDatePickerOpen(false)
                      }
                    }}
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

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    frequency: value as
                      | 'daily'
                      | 'weekly'
                      | 'monthly'
                      | 'yearly'
                      | undefined,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.frequency && (
              <div className="grid gap-2">
                <Label htmlFor="installments">Installments</Label>
                <Input
                  id="installments"
                  type="number"
                  value={formData.installments}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      installments: Number(e.target.value),
                    })
                  }
                />
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={
              isLoading ||
              isLoadingTypes ||
              !expenseTypeId ||
              !formValidation.isValid
            }
          >
            {isLoading || isLoadingTypes || !expenseTypeId
              ? 'Loading...'
              : 'Create'}
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
