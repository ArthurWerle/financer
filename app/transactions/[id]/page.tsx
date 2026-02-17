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
  Pencil,
  Trash2,
  CreditCard,
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useTransaction } from '@/queries/transactions/useTransaction'
import { useCategories } from '@/queries/categories/useCategories'
import { deleteTransaction } from '@/queries/transactions/deleteTransaction'
import { prepayTransaction } from '@/queries/transactions/prepayTransaction'
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

  const { data: transaction, isLoading, isError } = useTransaction(id)
  const { data: categories = [] } = useCategories()

  const categoryName = categories.find(
    (c) => c.id === transaction?.category_id
  )?.name

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
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
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
            <p className="font-medium">{humanReadableDate(transaction.date)}</p>
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
                  transaction.frequency as 'daily' | 'weekly' | 'monthly' | 'yearly'
                )}
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
              {humanReadableDate(transaction.created_at)}
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
          {transaction.is_recurring && (
            <Button
              variant="outline"
              onClick={handlePrepay}
              disabled={isPrepaying}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              {isPrepaying ? 'Prepaying...' : 'Prepay'}
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
    </div>
  )
}
