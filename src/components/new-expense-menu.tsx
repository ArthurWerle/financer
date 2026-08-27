'use client'

import { useState } from 'react'
import { Plus, PenLine, ReceiptText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AddExpense } from '@/components/add-expense'
import { CreateFromReceipt } from '@/components/create-from-receipt'

// The "New expense" button is now a small menu: manual entry (the existing form)
// or create-from-receipt (upload a photo, review, then create). Both dialogs are
// controlled from here so the menu decides which one opens.
export const NewExpenseMenu = () => {
  const [manualOpen, setManualOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="default"
            className="h-8 rounded-[7px] px-3 text-[12.5px] font-semibold"
          >
            <Plus size={13} />
            New expense
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-[200px]">
          <DropdownMenuItem onSelect={() => setManualOpen(true)}>
            <PenLine className="h-4 w-4" />
            Manual entry
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setReceiptOpen(true)}>
            <ReceiptText className="h-4 w-4" />
            Create from receipt
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Keeps the Cmd+K palette working: it opens the manual form by clicking
          #add-expense-button (see keyboard-nav-provider). */}
      <button
        id="add-expense-button"
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
        onClick={() => setManualOpen(true)}
      />

      <AddExpense open={manualOpen} onOpenChange={setManualOpen} hideTrigger />
      <CreateFromReceipt open={receiptOpen} onOpenChange={setReceiptOpen} />
    </>
  )
}
