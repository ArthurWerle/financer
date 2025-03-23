import { render, screen } from '../utils/test-utils';
import { Transaction } from '@/components/transaction';

describe('Transaction', () => {
  const mockExpenseTransaction = {
    id: '1',
    description: 'Grocery Shopping',
    categoryName: 'Food',
    amount: 150.75,
    typeName: 'expense',
    date: '2024-03-05',
  };

  const mockIncomeTransaction = {
    id: '2',
    description: 'Salary',
    categoryName: 'Income',
    amount: 5000.00,
    typeName: 'income',
    date: '2024-03-05',
  };

  const mockRecurringTransaction = {
    ...mockExpenseTransaction,
    id: '3',
    frequency: 'monthly',
    endDate: '2024-12-31',
  };

  it('should render expense transaction correctly', () => {
    render(<Transaction transaction={mockExpenseTransaction} />);
    
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,75')).toBeInTheDocument();
    expect(screen.getByText('Tuesday, March 5, 2024')).toBeInTheDocument();
  });

  it('should render income transaction correctly', () => {
    render(<Transaction transaction={mockIncomeTransaction} />);
    
    expect(screen.getByText('Salary')).toBeInTheDocument();
    expect(screen.getByText('Income')).toBeInTheDocument();
    expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
    expect(screen.getByText('Tuesday, March 5, 2024')).toBeInTheDocument();
  });

  it('should render recurring transaction with remaining payments', () => {
    render(<Transaction transaction={mockRecurringTransaction} />);
    
    expect(screen.getByText('Grocery Shopping')).toBeInTheDocument();
    expect(screen.getByText('Food')).toBeInTheDocument();
    expect(screen.getByText('R$ 150,75')).toBeInTheDocument();
    // The exact text will depend on your getLeftPayments implementation
    expect(screen.getByText(/\d+ payments left/)).toBeInTheDocument();
  });

  it('should apply animation props correctly', () => {
    render(<Transaction transaction={mockExpenseTransaction} index={2} />);
    
    const transactionElement = screen.getByText('Grocery Shopping').closest('div');
    expect(transactionElement).toHaveStyle('opacity: 1');
    expect(transactionElement).toHaveStyle('transform: translateY(0px)');
  });
}); 