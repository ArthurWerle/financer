import api from "@/utils/api"
import { BFF_BASE_URL } from "@/constants"
import { MessagePart } from "@/queries/chat/sendChat"

// A transaction proposed by the receipt scanner in dry-run (propose) mode. This
// mirrors ai-internal's ExtractedItemSchema — nothing has been created yet; the
// user reviews these and confirms before anything is persisted.
export type ProposedTransaction = {
  categoryId?: number
  subcategoryId?: number
  datetime: string
  value: number
  type?: "income" | "expense"
  description: string
  location?: string
}

// /ai/scan with dryRun returns one of: a clean proposal, a clarification request
// (the scanner couldn't tell what the purchase is), or a failure (422 body).
export type ProposeResult =
  | { success: true; needsClarification?: false; items: ProposedTransaction[] }
  | {
      success: true
      needsClarification: true
      question: string
      items: ProposedTransaction[]
    }
  | { success: false; error: string }

// Sends the receipt image for extraction WITHOUT creating anything. Reuses the
// existing /ai/scan pipeline with the new `dryRun` flag so the caller gets
// `items` to review. Like scanReceipt, a 422 { success:false } body is returned
// as a normal failed result instead of throwing.
export const proposeReceipt = async (
  messages: MessagePart[]
): Promise<ProposeResult> => {
  try {
    const { data } = await api.post<ProposeResult>(`${BFF_BASE_URL}/ai/scan`, {
      messages,
      dryRun: true,
    })
    return data
  } catch (error) {
    const data = (error as { response?: { data?: ProposeResult } })?.response
      ?.data
    if (data && data.success === false) {
      return data
    }
    throw error
  }
}

// Applies a natural-language correction ("muda a categoria do café para Lazer")
// to the current proposal. The scanner edits `previousItems` server-side and
// returns the full updated list — still dry-run, still nothing created.
export const refineReceipt = async (
  previousItems: ProposedTransaction[],
  correction: string
): Promise<ProposeResult> => {
  try {
    const { data } = await api.post<ProposeResult>(`${BFF_BASE_URL}/ai/scan`, {
      messages: [{ type: "text", content: correction }],
      dryRun: true,
      previousItems,
    })
    return data
  } catch (error) {
    const data = (error as { response?: { data?: ProposeResult } })?.response
      ?.data
    if (data && data.success === false) {
      return data
    }
    throw error
  }
}
