import { render, screen } from '../utils/test-utils'
import { Transaction } from '@/components/transaction'
import type { Transaction as TransactionType } from '@/types/transaction'
import type { Category } from '@/types/category'

describe('Transaction', () => {
  const categories = [
    { id: 1, name: 'Food' },
    { id: 2, name: 'Income' },
  ] as Category[]

  const mockExpenseTransaction: TransactionType = {
    id: 1,
    description: 'Grocery Shopping',
    category_id: 1,
    amount: 150.75,
    type: 'expense',
    date: '2024-03-05',
    is_prepaid: false,
    created_at: '2024-03-05',
    updated_at: '2024-03-05',
  }

  const mockIncomeTransaction: TransactionType = {
    ...mockExpenseTransaction,
    id: 2,
    description: 'Salary',
    category_id: 2,
    amount: 5000.0,
    type: 'income',
  }

  const mockRecurringTransaction: TransactionType = {
    ...mockExpenseTransaction,
    id: 3,
    is_recurring: true,
    frequency: 'monthly',
    end_date: '2099-12-31',
  }

  it('should render expense transaction correctly', () => {
    render(
      <Transaction
        transaction={mockExpenseTransaction}
        categories={categories}
      />
    )

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('R$ 150,75')).toBeInTheDocument()
    expect(screen.getByText('Monday, March 4, 2024')).toBeInTheDocument()
  })

  it('should render income transaction correctly', () => {
    render(
      <Transaction
        transaction={mockIncomeTransaction}
        categories={categories}
      />
    )

    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
    expect(screen.getByText('Monday, March 4, 2024')).toBeInTheDocument()
  })

  it('should render recurring transaction with remaining payments', () => {
    render(
      <Transaction
        transaction={mockRecurringTransaction}
        categories={categories}
      />
    )

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('R$ 150,75')).toBeInTheDocument()
    expect(screen.getByText(/\d+ payments left/)).toBeInTheDocument()
  })
})
