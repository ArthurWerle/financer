# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js-based personal finance management application built with TypeScript, React, and TailwindCSS. The app allows users to track transactions, categorize expenses, and view financial insights.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run lint` - Run ESLint
- `npm test` - Run Jest unit tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run Cypress end-to-end tests
- `npm run test:e2e:open` - Open Cypress test runner

## Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS with shadcn/ui components
- **State Management**: Zustand for global state
- **Data Fetching**: TanStack Query (React Query) with Axios
- **Testing**: Jest + React Testing Library for unit tests, Cypress for E2E
- **UI Components**: Radix UI primitives with custom styling

### Project Structure
- `app/` - Next.js App Router pages and layouts
- `src/components/` - React components (both UI and business logic)
- `src/components/ui/` - shadcn/ui component library
- `src/types/` - TypeScript type definitions
- `src/utils/` - Utility functions and API configuration
- `src/queries/` - TanStack Query hooks organized by domain (transactions, categories, types)
- `src/stores/` - Zustand state stores
- `src/hooks/` - Custom React hooks
- `src/tests/` - Test files with mocks and utilities

### Key Patterns
- **Data Fetching**: Uses TanStack Query for server state management with custom hooks in `src/queries/`
- **State Management**: Zustand stores for client-side state (e.g., `useFiltersStore`)
- **API Layer**: Centralized Axios instance in `src/utils/api.ts` with request/response interceptors
- **Component Architecture**: Mix of shadcn/ui components and custom business logic components
- **Type Safety**: Strong TypeScript typing with interfaces for all data models

### Testing Configuration
- Jest configured with Next.js integration
- Coverage thresholds set at 70% for all metrics
- Test setup includes MSW for API mocking
- Path mapping configured for `@/` imports

## Code Style Rules

- Do not include semicolons (";") in lines (enforced by Cursor rules)
- Uses shadcn/ui component patterns and TailwindCSS utilities
- TypeScript strict mode enabled