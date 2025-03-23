import { render, screen, waitFor } from '../utils/test-utils';
import { Statistics } from '@/components/statistics';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Statistics', () => {
  it('should render loading state initially', () => {
    render(<Statistics />);
    expect(screen.getByText('Financial Overview')).toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton')).toHaveLength(6);
  });

  it('should render financial data after loading', async () => {
    server.use(
      http.get('/api/month-overview', () => {
        return HttpResponse.json({
          income: {
            currentMonth: 5000.00,
            lastMonth: 4500.00,
            percentageVariation: 11.11,
          },
          expense: {
            currentMonth: 1500.75,
            lastMonth: 1800.50,
            percentageVariation: -16.67,
          },
        });
      })
    );

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('R$ 5.000,00')).toBeInTheDocument();
      expect(screen.getByText('R$ 1.500,75')).toBeInTheDocument();
      expect(screen.getByText('11% from last month')).toBeInTheDocument();
      expect(screen.getByText('-17% from last month')).toBeInTheDocument();
    });
  });

  it('should render expense comparison history', async () => {
    server.use(
      http.get('/api/expense-comparison', () => {
        return HttpResponse.json({
          months: ['Jan', 'Feb', 'Mar'],
          expenses: [1200, 1500, 1300],
        });
      })
    );

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('Expense Comparison History')).toBeInTheDocument();
      // Add more specific assertions based on your chart implementation
    });
  });

  it('should render expense categories', async () => {
    server.use(
      http.get('/api/categories', () => {
        return HttpResponse.json({
          categories: [
            { name: 'Food', amount: 800.50, percentage: 40 },
            { name: 'Transportation', amount: 700.25, percentage: 35 },
          ],
        });
      })
    );

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('Expense Categories')).toBeInTheDocument();
      expect(screen.getByText('Food')).toBeInTheDocument();
      expect(screen.getByText('Transportation')).toBeInTheDocument();
    });
  });

  it('should handle error states gracefully', async () => {
    server.use(
      http.get('/api/month-overview', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<Statistics />);

    await waitFor(() => {
      expect(screen.getByText('Error loading financial data')).toBeInTheDocument();
    });
  });
}); 