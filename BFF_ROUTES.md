# BFF Routes Implementation Guide

This document lists all the routes that need to be implemented in the BFF service to centralize all API calls from the frontend.

## Current Architecture

The frontend currently makes direct calls to:
- **Category Service** (port 8085)
- **Transaction Service V1** (port 8081)
- **Transaction Service V2** (port 1235)
- **Analytics Service** (port 1234)

All these calls need to be routed through the BFF service (port 8082).

---

## Routes Already Implemented in BFF ✅

These routes are already working and don't need changes:

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/bff/overview/by-month` | Monthly income/expense overview |
| GET | `/api/bff/expense-comparsion-history` | Historical expense comparison |
| GET | `/api/bff/monthly-expenses-by-category` | Category expense breakdown |
| POST | `/api/bff/transactions` | Create transaction |
| POST | `/api/bff/recurring-transactions` | Create recurring transaction |

---

## Routes That Need to Be Added to BFF

### 1. Category Management

#### GET `/api/bff/categories`
- **Purpose**: Fetch all categories
- **Backend Service**: Category Service → `GET http://localhost:8085/api/category`
- **Response Type**: `Category[]`
- **Query Parameters**: None
- **Notes**: Simple proxy to category service

#### POST `/api/bff/categories`
- **Purpose**: Create new category
- **Backend Service**: Category Service → `POST http://localhost:8085/api/category`
- **Request Body**: `Partial<Omit<Category, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>>`
- **Response Type**: Category creation response
- **Notes**: Simple proxy to category service

#### GET `/api/bff/types`
- **Purpose**: Fetch all transaction types (income, expense)
- **Backend Service**: Category Service → `GET http://localhost:8085/api/type`
- **Response Type**: `Type[]`
- **Query Parameters**: None
- **Notes**: Simple proxy to category service

---

### 2. Transaction Management (V1 - Legacy)

#### GET `/api/bff/transactions`
- **Purpose**: Fetch all transactions with optional filters
- **Backend Service**: Transaction Service V1 → `GET http://localhost:8081/api/combined-transactions/all`
- **Response Type**: `(Transaction & RecurringTransaction)[]`
- **Query Parameters**:
  - `category` (optional): Comma-separated category names
  - `currentMonth` (optional): Month filter (format: YYYY-MM)
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 !== 'true'`
  - Returns combined transactions and recurring transactions

#### GET `/api/bff/transactions/latest`
- **Purpose**: Fetch latest 3 transactions
- **Backend Service**: Transaction Service V1 → `GET http://localhost:8081/api/combined-transactions/latest/3`
- **Response Type**: `Transaction[]`
- **Query Parameters**: None
- **Notes**:
  - Limit is hardcoded to 3 in frontend
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 !== 'true'`

#### GET `/api/bff/transactions/biggest`
- **Purpose**: Fetch 3 biggest transactions by amount
- **Backend Service**: Transaction Service V1 → `GET http://localhost:8081/api/combined-transactions/biggest/3`
- **Response Type**: `Transaction[]`
- **Query Parameters**: None
- **Notes**:
  - Limit is hardcoded to 3 in frontend
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 !== 'true'`

---

### 3. Transaction Management (V2 - New)

#### GET `/api/bff/v2/transactions`
- **Purpose**: Fetch transactions with optional filters (V2 schema)
- **Backend Service**: Transaction Service V2 → `GET http://localhost:1235/api/v2/transactions`
- **Response Type**: `TransactionV2Response`
- **Query Parameters**:
  - `category` (optional): Comma-separated category names
  - `currentMonth` (optional): Month filter (format: YYYY-MM)
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`
  - V2 uses different response schema (snake_case vs camelCase)

#### POST `/api/bff/v2/transactions`
- **Purpose**: Create new transaction using V2 schema
- **Backend Service**: Transaction Service V2 → `POST http://localhost:1235/api/v2/transactions`
- **Request Body**: V2 transaction schema (snake_case fields)
- **Response Type**: Transaction creation response
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`
  - Different schema from V1

#### GET `/api/bff/v2/transactions/latest`
- **Purpose**: Fetch latest transactions (V2 schema)
- **Backend Service**: Transaction Service V2 → `GET http://localhost:1235/api/v2/transactions/latest`
- **Response Type**: `TransactionV2Response`
- **Query Parameters**: None
- **Notes**: Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`

#### GET `/api/bff/v2/transactions/biggest`
- **Purpose**: Fetch biggest transactions by amount (V2 schema)
- **Backend Service**: Transaction Service V2 → `GET http://localhost:1235/api/v2/transactions/biggest`
- **Response Type**: `TransactionV2Response`
- **Query Parameters**: None
- **Notes**: Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`

---

### 4. Analytics

#### GET `/api/bff/categories/average`
- **Purpose**: Get average spending per category
- **Backend Service**: Analytics Service → `GET http://localhost:1234/api/v1/categories/average`
- **Response Type**: `CategoryAverage[]`
- **Query Parameters**: None
- **Notes**: Calculates average amounts spent in each category

#### GET `/api/bff/types/average`
- **Purpose**: Get average income vs expense
- **Backend Service**: Analytics Service → `GET http://localhost:1234/api/v1/types/average`
- **Response Type**: `TypeAverage[]`
- **Query Parameters**: None
- **Notes**: Returns average amounts for income and expense types

---

## Implementation Priority

1. **High Priority** (Most Used):
   - GET `/api/bff/transactions` (both V1 and V2)
   - GET `/api/bff/categories`
   - GET `/api/bff/types`

2. **Medium Priority**:
   - GET `/api/bff/transactions/latest` (both V1 and V2)
   - GET `/api/bff/transactions/biggest` (both V1 and V2)
   - POST `/api/bff/categories`

3. **Low Priority** (Analytics):
   - GET `/api/bff/categories/average`
   - GET `/api/bff/types/average`

---

## Backend Services Configuration

For reference, here are the backend services the BFF needs to communicate with:

```
Category Service:    http://localhost:8085/api
Transaction V1:      http://localhost:8081/api
Transaction V2:      http://localhost:1235/api
Analytics Service:   http://localhost:1234/api/v1
```

In production, replace `localhost` with the appropriate service discovery mechanism or load balancer URLs.

---

## Testing Checklist

After implementing these routes, test:

- [ ] Categories CRUD operations
- [ ] Transaction types fetching
- [ ] Transaction filtering (both V1 and V2)
- [ ] Latest transactions display
- [ ] Biggest transactions display
- [ ] Category averages in analytics
- [ ] Type averages in analytics
- [ ] V1/V2 feature flag switching works correctly

---

## Migration Notes

1. All frontend query files will be updated to use BFF URLs
2. Direct service base URLs (CATEGORY_SERVICE_BASE_URL, etc.) can be removed from frontend constants
3. Feature flag `NEXT_PUBLIC_USE_TRANSACTIONS_V2` still needs to be respected
4. The BFF should handle all service-to-service communication
5. Frontend only needs to know about BFF_BASE_URL
