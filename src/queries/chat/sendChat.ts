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
  data?: { answer: string }
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

// General finance Q&A: stateless single prompt -> answer.
export const askQuestion = async (prompt: string): Promise<AskResult> => {
  const { data } = await api.post<AskResult>(`${BFF_BASE_URL}/ai/ask`, {
    prompt,
  })
  return data
}

// Reads a File into a base64 string with the "data:...;base64," prefix
// stripped, matching the shape ai-internal expects for image/audio parts.
export const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      resolve(result.split(",")[1] ?? "")
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
