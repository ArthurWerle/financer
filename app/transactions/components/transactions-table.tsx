'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarIcon,
  CreditCard,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { format } from 'date-fns'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Transaction } from '@/types/transaction'
import type { Category } from '@/types/category'
import { deleteTransaction } from '@/queries/transactions/deleteTransaction'
import { prepayTransaction } from '@/queries/transactions/prepayTransaction'
import {
  updateTransaction,
  UpdateTransactionData,
} from '@/queries/transactions/updateTransaction'
import { humanReadableDate } from '@/utils/format-date'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'

function ActionsCell({
  transaction,
  categories,
}: {
  transaction: Transaction
  categories: Category[]
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

  const isLastMonth = (() => {
    if (!transaction.end_date) return false
    const now = new Date()
    const end = new Date(transaction.end_date)
    return (
      now.getFullYear() === end.getFullYear() &&
      now.getMonth() === end.getMonth()
    )
  })()

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

  return (
    <>
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
                    onClick={
                      isLastMonth || transaction.is_prepaid
                        ? undefined
                        : handlePrepay
                    }
                    disabled={
                      isPrepaying || isLastMonth || transaction.is_prepaid
                    }
                  >
                    <CreditCard className="h-4 w-4" />
                    {isPrepaying ? 'Prepaying...' : 'Prepay'}
                  </DropdownMenuItem>
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
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

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
                    setEditData({ ...editData, amount: Number(e.target.value) })
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
                    setEditData({ ...editData, description: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`category-${transaction.id}`}>Category</Label>
                <Select
                  value={String(editData.category_id)}
                  onValueChange={(value) =>
                    setEditData({ ...editData, category_id: Number(value) })
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
                      {editData.date ? format(editData.date, 'PPP') : 'Pick a date'}
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

function getColumns(categories: Category[]): ColumnDef<Transaction>[] {
  return [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {humanReadableDate(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <div>
          <Link
            href={`/transactions/${row.original.id}`}
            className="font-medium hover:underline"
          >
            {row.original.description}
          </Link>
          {row.original.prepaid_from_id && (
            <Link href={`/transactions/${row.original.prepaid_from_id}`}>
              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium hover:bg-blue-200">
                Prepaid
              </span>
            </Link>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'category_id',
      header: 'Category',
      cell: ({ row }) => {
        const category = categories.find(
          (c) => c.id === row.original.category_id
        )
        return (
          <span className="text-sm text-gray-500">
            {category?.name ?? '—'}
          </span>
        )
      },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => {
        const isExpense = row.original.type === 'expense'
        return (
          <div className="flex items-center gap-1.5">
            {isExpense ? (
              <ArrowUpRight className="h-4 w-4 text-red-400" />
            ) : (
              <ArrowDownLeft className="h-4 w-4 text-green-400" />
            )}
            <span
              className={`text-sm font-medium capitalize ${isExpense ? 'text-red-500' : 'text-green-600'}`}
            >
              {row.original.type}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(row.original.amount)}
        </span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <ActionsCell transaction={row.original} categories={categories} />
      ),
    },
  ]
}

type TransactionsTableProps = {
  transactions: Transaction[]
  categories: Category[]
}

export function TransactionsTable({
  transactions,
  categories,
}: TransactionsTableProps) {
  const router = useRouter()
  const columns = getColumns(categories)

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (transactions.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No transactions found.</p>
    )
  }

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHead key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </TableHead>
            ))}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            className="cursor-pointer"
            onClick={() => router.push(`/transactions/${row.original.id}`)}
          >
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                onClick={
                  cell.column.id === 'actions'
                    ? (e) => e.stopPropagation()
                    : undefined
                }
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
