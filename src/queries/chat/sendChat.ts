import api from "@/utils/api"
import { BFF_BASE_URL } from "@/constants"
import { ScannedTransaction } from "@/stores/useChatStore"

export type MessagePart = {
  type: "text" | "image" | "audio"
  // image/audio content is base64 WITHOUT the "data:...;base64," prefix
  content: string
}

export type ScanResult =
  | { success: true; summary: string; transactions: ScannedTransaction[] }
  | { success: false; error: string }

export type AskResult = {
  success: boolean
  chatId?: string
  intent?: string
  answer?: string
  transactions?: ScannedTransaction[]
  error?: string
}

// Receipt/audio scan. ai-internal answers 422 with { success:false, error }
// when nothing is extractable — the BFF forwards that untouched, so surface it
// as a normal failed result instead of throwing.
export const scanReceipt = async (
  messages: MessagePart[]
): Promise<ScanResult> => {
  try {
    const { data } = await api.post<ScanResult>(`${BFF_BASE_URL}/ai/scan`, {
      messages,
    })
    return data
  } catch (error) {
    const data = (error as { response?: { data?: ScanResult } })?.response?.data
    if (data && data.success === false) {
      return data
    }
    throw error
  }
}

// Conversational Q&A. ai-internal persists both sides of the exchange in a
// chat: without a chatId it creates one (auto-titled from the first message)
// and returns its id; with a chatId it appends to that conversation. A 404
// (deleted/foreign chat) comes back as { success:false, error } instead of
// throwing so callers can recover by starting a fresh chat.
export const askQuestion = async (
  messages: MessagePart[],
  chatId?: string
): Promise<AskResult> => {
  try {
    const { data } = await api.post<AskResult>(`${BFF_BASE_URL}/ai/ask`, {
      messages,
      ...(chatId ? { chatId } : {}),
    })
    return data
  } catch (error) {
    const data = (error as { response?: { data?: AskResult } })?.response?.data
    if (data && data.success === false) {
      return data
    }
    throw error
  }
}

// Reads a File/Blob into a base64 string with the "data:...;base64," prefix
// stripped, matching the shape ai-internal expects for image/audio parts.
export const fileToBase64 = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1] ?? "")
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
