'use client'

import { use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  CalendarIcon,
  Pencil,
  Trash2,
  CreditCard,
  CircleCheck,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { useTransaction } from '@/queries/transactions/useTransaction'
import { useCategories } from '@/queries/categories/useCategories'
import { deleteTransaction } from '@/queries/transactions/deleteTransaction'
import { prepayTransaction } from '@/queries/transactions/prepayTransaction'
import {
  updateTransaction,
  UpdateTransactionData,
} from '@/queries/transactions/updateTransaction'
import { endTransaction } from '@/queries/transactions/endTransaction'
import { humanReadableDate } from '@/utils/format-date'
import { getLeftPayments } from '@/utils/get-left-payments'

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPrepaying, setIsPrepaying] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [isMarkFinishedOpen, setIsMarkFinishedOpen] = useState(false)
  const [isMarkingFinished, setIsMarkingFinished] = useState(false)
  const [finishedDatePickerOpen, setFinishedDatePickerOpen] = useState(false)
  const [finishedDate, setFinishedDate] = useState<Date>(new Date())

  const { data: transaction, isLoading, isError } = useTransaction(id)
  const { data: categories = [] } = useCategories()

  const isLastMonth = (() => {
    if (!transaction?.end_date) return false
    const now = new Date()
    const end = new Date(transaction.end_date)
    return (
      now.getFullYear() === end.getFullYear() &&
      now.getMonth() === end.getMonth()
    )
  })()

  const shouldShowMarkFinished = (() => {
    if (!transaction?.is_recurring) return false
    if (!transaction.end_date) return true
    const now = new Date()
    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    )
    return new Date(transaction.end_date) < oneMonthAgo
  })()

  const handleMarkFinished = async () => {
    if (!transaction) return
    setIsMarkingFinished(true)
    await endTransaction(transaction.id, finishedDate.toISOString())
      .then(() => {
        toast.success('Transaction marked as finished')
        queryClient.invalidateQueries()
        setIsMarkFinishedOpen(false)
      })
      .catch((error) => {
        toast.error(
          `ERROR: ${error?.message || 'Error marking transaction as finished'}`
        )
      })
      .finally(() => {
        setIsMarkingFinished(false)
      })
  }

  const categoryName = categories.find(
    (c) => c.id === transaction?.category_id
  )?.name

  const handleEditOpen = () => {
    if (!transaction) return
    setEditData({
      amount: transaction.amount,
      description: transaction.description,
      category_id: transaction.category_id,
      date: new Date(transaction.date),
      frequency: transaction.frequency,
    })
    setIsEditOpen(true)
  }

  const [editData, setEditData] = useState({
    amount: 0,
    description: '',
    category_id: 0,
    date: new Date(),
    frequency: undefined as string | undefined,
  })

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction) return
    setIsSubmitting(true)

    const data: UpdateTransactionData = {
      amount: editData.amount,
      description: editData.description,
      category_id: editData.category_id,
      date: editData.date.toISOString(),
      frequency: editData.frequency,
    }

    await updateTransaction(transaction.id, data)
      .then(() => {
        toast.success('Transaction updated')
        queryClient.invalidateQueries()
        setIsEditOpen(false)
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error updating transaction'}`)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount)

  const handleDelete = async () => {
    if (!transaction) return
    setIsDeleting(true)
    await deleteTransaction(transaction.id)
      .then(() => {
        toast.success('Transaction deleted')
        queryClient.invalidateQueries()
        router.push('/transactions')
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error deleting transaction'}`)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  const handlePrepay = async () => {
    if (!transaction) return
    setIsPrepaying(true)
    await prepayTransaction(transaction.id)
      .then(() => {
        toast.success('Transaction prepaid')
        queryClient.invalidateQueries()
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error prepaying transaction'}`)
      })
      .finally(() => {
        setIsPrepaying(false)
      })
  }

  if (isLoading) {
    return (
      <div className="p-8">
        <p>...Loading</p>
      </div>
    )
  }

  if (isError || !transaction) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error loading transaction.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go back
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-2xl">
      <Button variant="ghost" className="mb-4" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>

      <Card className="p-6 bg-white shadow-lg rounded-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{transaction.description}</h1>
            <div className="flex items-center gap-2 mt-1">
              {categoryName && (
                <Badge variant="secondary">{categoryName}</Badge>
              )}
              {transaction.is_recurring && (
                <Badge variant="outline">Recurring</Badge>
              )}
              {transaction.is_prepaid && (
                <Badge className="bg-green-100 text-green-700">Prepaid</Badge>
              )}
              {transaction.prepaid_from_id && (
                <Link href={`/transactions/${transaction.prepaid_from_id}`}>
                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer">
                    Prepaid
                  </Badge>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {transaction.type === 'expense' ? (
              <ArrowUpRight className="h-6 w-6 text-red-400" />
            ) : (
              <ArrowDownLeft className="h-6 w-6 text-green-400" />
            )}
            <span className="text-2xl font-bold">
              {formatCurrency(transaction.amount)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium capitalize">{transaction.type}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">
              {humanReadableDate(transaction.date, true)}
            </p>
          </div>
          {transaction.frequency && (
            <div>
              <p className="text-gray-500">Frequency</p>
              <p className="font-medium capitalize">{transaction.frequency}</p>
            </div>
          )}
          {transaction.is_recurring && (
            <div>
              <p className="text-gray-500">Payments left</p>
              <p className="font-medium">
                {getLeftPayments(
                  transaction.end_date,
                  transaction.frequency as
                    | 'daily'
                    | 'weekly'
                    | 'monthly'
                    | 'yearly'
                )}
              </p>
            </div>
          )}
          {transaction.is_recurring && transaction.total_paid !== undefined && (
            <div>
              <p className="text-gray-500">Total paid</p>
              <p className="font-medium">
                {formatCurrency(transaction.total_paid)}
              </p>
            </div>
          )}
          {transaction.is_recurring && transaction.total_left !== undefined && (
            <div>
              <p className="text-gray-500">Total left</p>
              <p className="font-medium">
                {formatCurrency(transaction.total_left)}
              </p>
            </div>
          )}
          {transaction.category_month_percent !== undefined && (
            <div>
              <p className="text-gray-500">% of category this month</p>
              <p className="font-medium">
                {transaction.category_month_percent.toFixed(1)}%
              </p>
            </div>
          )}
          {transaction.total_month_percent !== undefined && (
            <div>
              <p className="text-gray-500">% of total expenses this month</p>
              <p className="font-medium">
                {transaction.total_month_percent.toFixed(1)}%
              </p>
            </div>
          )}
          {transaction.start_date && (
            <div>
              <p className="text-gray-500">Start date</p>
              <p className="font-medium">
                {humanReadableDate(transaction.start_date)}
              </p>
            </div>
          )}
          {transaction.end_date && (
            <div>
              <p className="text-gray-500">End date</p>
              <p className="font-medium">
                {humanReadableDate(transaction.end_date)}
              </p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Created at</p>
            <p className="font-medium">
              {humanReadableDate(transaction.created_at, true)}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Updated at</p>
            <p className="font-medium">
              {humanReadableDate(transaction.updated_at)}
            </p>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" onClick={handleEditOpen}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          {transaction.is_recurring && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      variant="outline"
                      onClick={handlePrepay}
                      disabled={
                        isPrepaying || isLastMonth || transaction.is_prepaid
                      }
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isPrepaying ? 'Prepaying...' : 'Prepay'}
                    </Button>
                  </span>
                </TooltipTrigger>
                {(isLastMonth || transaction.is_prepaid) && (
                  <TooltipContent>
                    <p>
                      {transaction.is_prepaid
                        ? 'Already prepaid'
                        : 'Cannot prepay — this is the last month'}
                    </p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
          {shouldShowMarkFinished && (
            <Button
              variant="outline"
              onClick={() => {
                setFinishedDate(new Date())
                setIsMarkFinishedOpen(true)
              }}
            >
              <CircleCheck className="h-4 w-4 mr-2" />
              Mark as Finished
            </Button>
          )}
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </Card>

      <Dialog open={isMarkFinishedOpen} onOpenChange={setIsMarkFinishedOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Mark as Finished</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>End date</Label>
              <Popover
                open={finishedDatePickerOpen}
                onOpenChange={setFinishedDatePickerOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {finishedDate ? format(finishedDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={finishedDate}
                    onSelect={(date) => {
                      if (date) {
                        setFinishedDate(date)
                        setFinishedDatePickerOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <Button
              className="w-full"
              onClick={handleMarkFinished}
              disabled={isMarkingFinished}
            >
              {isMarkingFinished ? 'Saving...' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-amount">Amount</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={editData.amount}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      amount: Number(e.target.value),
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editData.description}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      description: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={String(editData.category_id)}
                  onValueChange={(value) =>
                    setEditData({
                      ...editData,
                      category_id: Number(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
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
                      {editData.date
                        ? format(editData.date, 'PPP')
                        : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={editData.date}
                      onSelect={(date) => {
                        if (date) {
                          setEditData({ ...editData, date })
                          setDatePickerOpen(false)
                        }
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-frequency">Frequency</Label>
                <Select
                  value={editData.frequency || ''}
                  onValueChange={(value) =>
                    setEditData({
                      ...editData,
                      frequency: value || undefined,
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
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
