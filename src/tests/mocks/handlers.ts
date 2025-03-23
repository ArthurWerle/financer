import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock transaction endpoints
  http.get('/api/transactions', () => {
    return HttpResponse.json({
      transactions: [
        {
          id: '1',
          description: 'Grocery Shopping',
          categoryName: 'Food',
          amount: 150.75,
          typeName: 'expense',
          date: '2024-03-05',
        },
        {
          id: '2',
          description: 'Salary',
          categoryName: 'Income',
          amount: 5000.00,
          typeName: 'income',
          date: '2024-03-05',
        },
      ],
    });
  }),

  // Mock categories endpoints
  http.get('/api/categories', () => {
    return HttpResponse.json({
      categories: [
        { id: '1', name: 'Food', type: 'expense' },
        { id: '2', name: 'Income', type: 'income' },
        { id: '3', name: 'Transportation', type: 'expense' },
      ],
    });
  }),

  // Mock statistics endpoints
  http.get('/api/statistics', () => {
    return HttpResponse.json({
      totalIncome: 5000.00,
      totalExpenses: 1500.75,
      balance: 3499.25,
      topCategories: [
        { name: 'Food', amount: 800.50 },
        { name: 'Transportation', amount: 700.25 },
      ],
    });
  }),
]; 