import { useCallback } from "react"
import { toast } from "react-toastify"
import { useChatStore } from "@/stores/useChatStore"
import {
  askQuestion,
  fileToBase64,
  scanReceipt,
  MessagePart,
} from "@/queries/chat/sendChat"

export type Attachment = {
  file: File
  kind: "image" | "audio"
  // full "data:...;base64," url, kept only for image previews
  previewUrl?: string
}

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// Owns the send + endpoint-routing logic: an image/audio attachment goes to
// /scan (creates transactions), a text-only message goes to /ask (Q&A).
export const useSendChat = () => {
  const addMessage = useChatStore((state) => state.addMessage)
  const updateMessage = useChatStore((state) => state.updateMessage)

  return useCallback(
    async (text: string, attachment: Attachment | null) => {
      const trimmed = text.trim()
      if (!trimmed && !attachment) return

      addMessage({
        id: createId(),
        role: "user",
        text: trimmed || undefined,
        imageDataUrl:
          attachment?.kind === "image" ? attachment.previewUrl : undefined,
        audioName:
          attachment?.kind === "audio" ? attachment.file.name : undefined,
      })

      const assistantId = createId()
      addMessage({ id: assistantId, role: "assistant", pending: true })

      try {
        if (attachment) {
          const base64 = await fileToBase64(attachment.file)
          const messages: MessagePart[] = [
            { type: "text", content: trimmed || "Please scan this receipt." },
            { type: attachment.kind, content: base64 },
          ]

          const result = await scanReceipt(messages)

          if (result.success) {
            updateMessage(assistantId, {
              pending: false,
              text: result.summary,
              transactions: result.transactions,
            })
          } else {
            updateMessage(assistantId, {
              pending: false,
              error: true,
              text: result.error,
            })
          }
        } else {
          const result = await askQuestion(trimmed)
          updateMessage(assistantId, {
            pending: false,
            error: !result.success,
            text:
              result.data?.answer ??
              result.error ??
              "Something went wrong. Please try again.",
          })
        }
      } catch (error) {
        console.error(error)
        toast.error("Couldn't reach the assistant. Please try again.")
        updateMessage(assistantId, {
          pending: false,
          error: true,
          text: "Something went wrong. Please try again.",
        })
      }
    },
    [addMessage, updateMessage]
  )
}
