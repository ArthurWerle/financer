# BFF Routes Implementation Guide

This document lists all the routes that need to be implemented in the BFF service to centralize all API calls from the frontend.

## Current Architecture

The frontend currently makes direct calls to:
- **Category Service** (port 8085)
- **Transaction Service V1** (port 8081)
- **Transaction Service V2** (port 1235)
- **Analytics Service** (port 1234)

All these calls need to be routed through the BFF service (port 8082). **The BFF acts as a transparent proxy, maintaining the same route structure as the backend services.**

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

#### GET `/api/bff/category`
- **Purpose**: Fetch all categories
- **Backend Service**: Category Service → `GET http://localhost:8085/api/category`
- **Response Type**: `Category[]`
- **Query Parameters**: None
- **Notes**: Proxy request to category service maintaining same path

#### POST `/api/bff/category`
- **Purpose**: Create new category
- **Backend Service**: Category Service → `POST http://localhost:8085/api/category`
- **Request Body**: `Partial<Omit<Category, 'ID' | 'CreatedAt' | 'UpdatedAt' | 'DeletedAt'>>`
- **Response Type**: Category creation response
- **Notes**: Proxy request to category service maintaining same path

#### GET `/api/bff/type`
- **Purpose**: Fetch all transaction types (income, expense)
- **Backend Service**: Category Service → `GET http://localhost:8085/api/type`
- **Response Type**: `Type[]`
- **Query Parameters**: None
- **Notes**: Proxy request to category service maintaining same path

---

### 2. Transaction Management (V1 - Legacy)

#### GET `/api/bff/combined-transactions/all`
- **Purpose**: Fetch all transactions with optional filters
- **Backend Service**: Transaction Service V1 → `GET http://localhost:8081/api/combined-transactions/all`
- **Response Type**: `(Transaction & RecurringTransaction)[]`
- **Query Parameters**:
  - `category` (optional): Comma-separated category names
  - `currentMonth` (optional): Month filter (format: YYYY-MM)
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 !== 'true'`
  - Returns combined transactions and recurring transactions
  - Proxy maintains exact same path structure

#### GET `/api/bff/combined-transactions/latest/3`
- **Purpose**: Fetch latest 3 transactions
- **Backend Service**: Transaction Service V1 → `GET http://localhost:8081/api/combined-transactions/latest/3`
- **Response Type**: `Transaction[]`
- **Query Parameters**: None
- **Notes**:
  - Limit of 3 is in the path
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 !== 'true'`
  - Proxy maintains exact same path structure

#### GET `/api/bff/combined-transactions/biggest/3`
- **Purpose**: Fetch 3 biggest transactions by amount
- **Backend Service**: Transaction Service V1 → `GET http://localhost:8081/api/combined-transactions/biggest/3`
- **Response Type**: `Transaction[]`
- **Query Parameters**: None
- **Notes**:
  - Limit of 3 is in the path
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 !== 'true'`
  - Proxy maintains exact same path structure

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
  - Proxy maintains exact same path structure

#### POST `/api/bff/v2/transactions`
- **Purpose**: Create new transaction using V2 schema
- **Backend Service**: Transaction Service V2 → `POST http://localhost:1235/api/v2/transactions`
- **Request Body**: V2 transaction schema (snake_case fields)
- **Response Type**: Transaction creation response
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`
  - Different schema from V1
  - Proxy maintains exact same path structure

#### GET `/api/bff/v2/transactions/latest`
- **Purpose**: Fetch latest transactions (V2 schema)
- **Backend Service**: Transaction Service V2 → `GET http://localhost:1235/api/v2/transactions/latest`
- **Response Type**: `TransactionV2Response`
- **Query Parameters**: None
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`
  - Proxy maintains exact same path structure

#### GET `/api/bff/v2/transactions/biggest`
- **Purpose**: Fetch biggest transactions by amount (V2 schema)
- **Backend Service**: Transaction Service V2 → `GET http://localhost:1235/api/v2/transactions/biggest`
- **Response Type**: `TransactionV2Response`
- **Query Parameters**: None
- **Notes**:
  - Used when `NEXT_PUBLIC_USE_TRANSACTIONS_V2 === 'true'`
  - Proxy maintains exact same path structure

---

### 4. Analytics

#### GET `/api/bff/v1/categories/average`
- **Purpose**: Get average spending per category
- **Backend Service**: Analytics Service → `GET http://localhost:1234/api/v1/categories/average`
- **Response Type**: `CategoryAverage[]`
- **Query Parameters**: None
- **Notes**:
  - Calculates average amounts spent in each category
  - Proxy maintains exact same path structure including `/v1/`

#### GET `/api/bff/v1/types/average`
- **Purpose**: Get average income vs expense
- **Backend Service**: Analytics Service → `GET http://localhost:1234/api/v1/types/average`
- **Response Type**: `TypeAverage[]`
- **Query Parameters**: None
- **Notes**:
  - Returns average amounts for income and expense types
  - Proxy maintains exact same path structure including `/v1/`

---

## Implementation Priority

1. **High Priority** (Most Used):
   - GET `/api/bff/combined-transactions/all` (V1)
   - GET `/api/bff/v2/transactions` (V2)
   - GET `/api/bff/category`
   - GET `/api/bff/type`

2. **Medium Priority**:
   - GET `/api/bff/combined-transactions/latest/3` (V1)
   - GET `/api/bff/v2/transactions/latest` (V2)
   - GET `/api/bff/combined-transactions/biggest/3` (V1)
   - GET `/api/bff/v2/transactions/biggest` (V2)
   - POST `/api/bff/category`

3. **Low Priority** (Analytics):
   - GET `/api/bff/v1/categories/average`
   - GET `/api/bff/v1/types/average`

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

## Implementation Notes

**The BFF should act as a transparent proxy:**
- Maintain the exact same route structure as the backend services
- Forward all query parameters unchanged
- Forward request bodies unchanged
- Return responses unchanged (or with minimal transformation)
- This approach makes the BFF implementation straightforward and keeps API consistency

For example:
- Frontend calls: `GET ${BFF_BASE_URL}/category`
- BFF proxies to: `GET ${CATEGORY_SERVICE}/category`
- Frontend receives the same response structure as if calling the service directly

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
- [ ] Query parameters are correctly forwarded
- [ ] Request bodies are correctly forwarded

---

## Migration Notes

1. Frontend now uses `BFF_BASE_URL` for all API calls
2. Direct service base URLs (CATEGORY_SERVICE_BASE_URL, etc.) have been removed from frontend
3. Feature flag `NEXT_PUBLIC_USE_TRANSACTIONS_V2` is still respected in frontend
4. The BFF handles all service-to-service communication
5. Route paths are maintained exactly as they are in backend services (transparent proxy pattern)
