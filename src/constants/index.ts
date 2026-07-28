import { TransactionType } from "@/enums/enums"

const baseURL =
  process.env.NODE_ENV === 'production'
    ? `http://${process.env.NEXT_PUBLIC_SERVER_BASE_URL}`
    : 'http://localhost'

const BFF_PORT = process.env.NEXT_PUBLIC_BFF_PORT || '8082'

export const BFF_BASE_URL = `${baseURL}:${BFF_PORT}/api/bff` as const

// Identifies this service when creating/listing AI chats so ai-internal keeps
// each service's conversations separate (see the chats `origin` column).
export const CHAT_ORIGIN = "financer" as const

export const TYPES = [TransactionType.Income, TransactionType.Expense]
