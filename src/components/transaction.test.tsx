import { render, screen } from '../utils/test-utils'
import { Transaction } from '@/components/transaction'

describe('Transaction', () => {
  const mockExpenseTransaction = {
    id: '1',
    description: 'Grocery Shopping',
    categoryName: 'Food',
    amount: 150.75,
    typeName: 'expense',
    date: '2024-03-05',
  }

  const mockIncomeTransaction = {
    id: '2',
    description: 'Salary',
    categoryName: 'Income',
    amount: 5000.0,
    typeName: 'income',
    date: '2024-03-05',
  }

  const mockRecurringTransaction = {
    ...mockExpenseTransaction,
    id: '3',
    frequency: 'monthly',
    endDate: '2024-12-31',
  }

  it('should render expense transaction correctly', () => {
    render(<Transaction transaction={mockExpenseTransaction} />)

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('R$ 150,75')).toBeInTheDocument()
    expect(screen.getByText('Monday, March 4, 2024')).toBeInTheDocument()
  })

  it('should render income transaction correctly', () => {
    render(<Transaction transaction={mockIncomeTransaction} />)

    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument()
    expect(screen.getByText('Monday, March 4, 2024')).toBeInTheDocument()
  })

  it('should render recurring transaction with remaining payments', () => {
    render(<Transaction transaction={mockRecurringTransaction} />)

    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument()
    expect(screen.getByText('Food')).toBeInTheDocument()
    expect(screen.getByText('R$ 150,75')).toBeInTheDocument()
    // The exact text will depend on your getLeftPayments implementation
    expect(screen.getByText(/\d+ payments left/)).toBeInTheDocument()
  })
})
