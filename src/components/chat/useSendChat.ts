import { useCallback } from "react"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { useChatStore } from "@/stores/useChatStore"
import {
  askQuestion,
  fileToBase64,
  scanReceipt,
  MessagePart,
} from "@/queries/chat/sendChat"
import { KEY as CHATS_KEY } from "@/queries/chat/useChats"

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
  const queryClient = useQueryClient()

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
          // Continue the widget's persisted conversation when one exists.
          const chatId = useChatStore.getState().chatId ?? undefined
          const result = await askQuestion(
            [{ type: "text", content: trimmed }],
            chatId
          )

          if (result.success && result.chatId) {
            useChatStore.getState().setChatId(result.chatId)
            // The conversation now exists server-side — surface it in the
            // chat page's sidebar.
            queryClient.invalidateQueries({ queryKey: [CHATS_KEY] })
          } else if (!result.success) {
            // Stale chat (deleted elsewhere / foreign): start fresh next send.
            useChatStore.getState().setChatId(null)
          }

          updateMessage(assistantId, {
            pending: false,
            error: !result.success,
            text:
              result.answer ??
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
    [addMessage, updateMessage, queryClient]
  )
}
