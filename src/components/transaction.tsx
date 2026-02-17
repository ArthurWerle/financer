import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { Transaction } from '../types/transaction'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarIcon,
  MoreVertical,
  CreditCard,
  Pencil,
  Trash2,
} from 'lucide-react'
import { getLeftPayments } from '../utils/get-left-payments'
import { humanReadableDate } from '../utils/format-date'
import { Category } from '@/types/category'
import { deleteTransaction } from '@/queries/transactions/deleteTransaction'
import { prepayTransaction } from '@/queries/transactions/prepayTransaction'
import {
  updateTransaction,
  UpdateTransactionData,
} from '@/queries/transactions/updateTransaction'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { format } from 'date-fns'

export function Transaction({
  transaction,
  categories,
  index,
}: {
  transaction: Transaction
  categories: Category[]
  index?: number
}) {
  const queryClient = useQueryClient()
  const [isPrepaying, setIsPrepaying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)

  const [editData, setEditData] = useState({
    amount: transaction.amount,
    description: transaction.description,
    category_id: transaction.category_id,
    date: new Date(transaction.date),
    frequency: transaction.frequency,
  })

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteTransaction(transaction.id)
      .then(() => {
        toast.success('Transaction deleted')
        queryClient.invalidateQueries()
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error deleting transaction'}`)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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

  const handlePrepay = async () => {
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

  const handleEditOpen = () => {
    setEditData({
      amount: transaction.amount,
      description: transaction.description,
      category_id: transaction.category_id,
      date: new Date(transaction.date),
      frequency: transaction.frequency,
    })
    setIsEditOpen(true)
  }

  const isLastMonth = (() => {
    if (!transaction.end_date) return false
    const now = new Date()
    const end = new Date(transaction.end_date)
    return now.getFullYear() === end.getFullYear() && now.getMonth() === end.getMonth()
  })()

  const description = transaction.description
  const amount = transaction.amount
  const date = transaction.date
  const categoryName = categories?.find(
    (category) => category.id === transaction.category_id
  )?.name
  const endDate = transaction.end_date
  const frequency = transaction.frequency
  const isRecurringTransaction = transaction.is_recurring
  const type = transaction.type

  return (
    <>
      <motion.div
        key={transaction.id + (index || amount)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: (index || 1) * 0.1 }}
      >
        <div className="flex justify-between items-center mb-2">
          <div>
            <Link href={`/transactions/${transaction.id}`} className="font-medium hover:underline">
              {description}
            </Link>
            <div className="flex items-center gap-1.5">
              {categoryName && (
                <p className="text-sm text-gray-500">{categoryName}</p>
              )}
              {transaction.prepaid_from_id && (
                <Link href={`/transactions/${transaction.prepaid_from_id}`}>
                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium hover:bg-blue-200">
                    Prepaid
                  </span>
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <div className="flex gap-2 justify-end">
                {type === 'expense' ? (
                  <ArrowUpRight className="h-5 w-5 text-red-400" />
                ) : (
                  <ArrowDownLeft className="h-5 w-5 text-green-400" />
                )}
                <span className="font-medium">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(amount)}
                </span>
              </div>
              <div className="flex gap-2 justify-end">
                {!isRecurringTransaction && (
                  <p className="text-xs text-gray-500">
                    {`${humanReadableDate(date)}`}
                  </p>
                )}
                {isRecurringTransaction && (
                  <p className="text-sm text-gray-500">
                    {getLeftPayments(
                      endDate,
                      frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
                    )}
                  </p>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isDeleting || isPrepaying}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEditOpen}>
                  <Pencil className="h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {transaction.is_recurring && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuItem
                          onClick={isLastMonth || transaction.is_prepaid ? undefined : handlePrepay}
                          disabled={isPrepaying || isLastMonth || transaction.is_prepaid}
                        >
                          <CreditCard className="h-4 w-4" />
                          {isPrepaying ? 'Prepaying...' : 'Prepay'}
                        </DropdownMenuItem>
                      </TooltipTrigger>
                      {(isLastMonth || transaction.is_prepaid) && (
                        <TooltipContent>
                          <p>{transaction.is_prepaid ? 'Already prepaid' : 'Cannot prepay — this is the last month'}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>
                )}
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
        </div>
      </motion.div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`amount-${transaction.id}`}>Amount</Label>
                <Input
                  id={`amount-${transaction.id}`}
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
                <Label htmlFor={`description-${transaction.id}`}>
                  Description
                </Label>
                <Input
                  id={`description-${transaction.id}`}
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
                <Label htmlFor={`category-${transaction.id}`}>Category</Label>
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
                <Label htmlFor={`frequency-${transaction.id}`}>Frequency</Label>
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
    </>
  )
}
