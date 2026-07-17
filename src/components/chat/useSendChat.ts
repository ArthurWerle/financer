import { useCallback } from "react"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { useChatStore } from "@/stores/useChatStore"
import {
  askQuestion,
  fileToBase64,
  MessagePart,
} from "@/queries/chat/sendChat"
import { compressImage } from "@/utils/compressImage"
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

// Owns the widget's send logic. Everything — text and attachments — goes
// through /ask so the whole conversation (receipts included) is persisted
// server-side and shows up in the Assistant page's chat list.
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
        const messages: MessagePart[] = [
          {
            type: "text",
            content: trimmed || "Please scan this receipt.",
          },
        ]
        if (attachment) {
          // Shrink photos before base64-encoding so the JSON payload stays
          // within server body limits; audio is sent as-is.
          const payloadBlob =
            attachment.kind === "image"
              ? await compressImage(attachment.file)
              : attachment.file
          const base64 = await fileToBase64(payloadBlob)
          messages.push({ type: attachment.kind, content: base64 })
        }

        // Continue the widget's persisted conversation when one exists.
        const chatId = useChatStore.getState().chatId ?? undefined
        const result = await askQuestion(messages, chatId)

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
