import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { useCategories } from '../queries/categories/useCategories'
import { useTypes } from '../queries/types/useTypes'
import { addTransaction } from '../queries/transactions/addTransaction'
import { KEY as MONTH_OVERVIEW_QUERY_KEY } from '@/src/queries/transactions/useMonthOverview'
import { KEY as WEEK_OVERVIEW_QUERY_KEY } from '@/src/queries/transactions/useWeekOverview'
import { KEY as EXPENSE_COMPARSION_HISTORY_QUERY_KEY } from '@/src/queries/transactions/useExpenseComparsionHistory'
import { KEY as TRANSACTIONS_QUERY_KEY } from '@/src/queries/transactions/useTransactions'
import { KEY as CATEGORIES_MONTHLY_EXPENSE_QUERY_KEY } from '@/src/queries/categories/useCategoriesMonthlyExpense'
import { useQueryClient } from '@tanstack/react-query'
import { Transaction } from '../types/transaction'
import { RecurringTransaction } from '../types/recurring-transaction'

type FormData = Partial<
  Omit<Transaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt' | 'date'> &
  Omit<RecurringTransaction, 'id' | 'typeName' | 'createdAt' | 'updatedAt' | 'startDate'>> & {
    date: Date
    startDate: Date
  }

export const AddTransaction = () => {
  const today = new Date()
  const [formData, setFormData] = useState<FormData>({
    amount: undefined,
    categoryId: undefined,
    typeId: undefined,
    description: '',
    date: today,
    frequency: '',
    startDate: today,
    endDate: undefined,
    lastOccurrence: undefined,
  })

  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const { data: categories, isLoading: isLoadingCategories } = useCategories()
  const { data: types, isLoading: isLoadingTypes } = useTypes()

  const handleSubmit = async (e: any) => {
    setIsLoading(true)

    await addTransaction(formData)
      .catch((error) => console.error(error))
      .finally(() => {
        queryClient.invalidateQueries({ queryKey: MONTH_OVERVIEW_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: WEEK_OVERVIEW_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: EXPENSE_COMPARSION_HISTORY_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
        queryClient.invalidateQueries({ queryKey: CATEGORIES_MONTHLY_EXPENSE_QUERY_KEY })
        setIsLoading(false)
      })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">Add Transaction</Button>
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
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, categoryId: Number(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingCategories ? (
                    <SelectItem value="" disabled>Loading categories...</SelectItem>
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
              <Label htmlFor="type">Type</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, typeId: Number(value) })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingTypes ? (
                    <SelectItem value="" disabled>Loading types...</SelectItem>
                  ) : (
                    types?.map((type) => (
                      <SelectItem key={type.ID} value={String(type.ID)}>
                        {type.Name}
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
                  <Button variant="outline" className="justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, "PPP") : "Pick a date"}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
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
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(formData.endDate, "PPP") : "Pick an end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate}
                      onSelect={(date) => setFormData({ ...formData, endDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Create"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}