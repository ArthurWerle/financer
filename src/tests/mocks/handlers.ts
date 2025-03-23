import { rest } from 'msw'

export const handlers = [
  // Mock month overview endpoint
  rest.get(
    'http://localhost:8082/api/bff/overview/by-month',
    (req, res, ctx) => {
      return res(
        ctx.json({
          income: {
            currentMonth: 5000.0,
            lastMonth: 4500.0,
            percentageVariation: 11.11,
          },
          expense: {
            currentMonth: 1500.75,
            lastMonth: 1800.5,
            percentageVariation: -16.67,
          },
        })
      )
    }
  ),

  // Mock expense comparison history endpoint
  rest.get(
    'http://localhost:8082/api/bff/expense-comparsion-history',
    (req, res, ctx) => {
      return res(
        ctx.json({
          months: ['Jan', 'Feb', 'Mar'],
          expenses: [1200, 1500, 1300],
        })
      )
    }
  ),

  // Mock monthly expenses by category endpoint
  rest.get(
    'http://localhost:8082/api/bff/monthly-expenses-by-category',
    (req, res, ctx) => {
      return res(
        ctx.json({
          categories: [
            { name: 'Food', amount: 800.5, percentage: 40 },
            { name: 'Transportation', amount: 700.25, percentage: 35 },
          ],
        })
      )
    }
  ),

  // Mock latest transactions endpoint
  rest.get(
    'http://localhost:8081/api/combined-transactions/latest/3',
    (req, res, ctx) => {
      return res(ctx.json([]))
    }
  ),

  // Mock biggest transactions endpoint
  rest.get(
    'http://localhost:8081/api/combined-transactions/biggest/3',
    (req, res, ctx) => {
      return res(ctx.json([]))
    }
  ),

  // Mock transaction endpoints
  rest.get('/api/transactions', (req, res, ctx) => {
    return res(
      ctx.json({
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
            amount: 5000.0,
            typeName: 'income',
            date: '2024-03-05',
          },
        ],
      })
    )
  }),

  // Mock categories endpoints
  rest.get('/api/categories', (req, res, ctx) => {
    return res(
      ctx.json({
        categories: [
          { id: '1', name: 'Food', type: 'expense' },
          { id: '2', name: 'Income', type: 'income' },
          { id: '3', name: 'Transportation', type: 'expense' },
        ],
      })
    )
  }),

  // Mock statistics endpoints
  rest.get('/api/statistics', (req, res, ctx) => {
    return res(
      ctx.json({
        totalIncome: 5000.0,
        totalExpenses: 1500.75,
        balance: 3499.25,
        topCategories: [
          { name: 'Food', amount: 800.5 },
          { name: 'Transportation', amount: 700.25 },
        ],
      })
    )
  }),
]
