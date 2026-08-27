import { useCallback } from "react"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { ChatMessage, useChatStore } from "@/stores/useChatStore"
import { fileToBase64, MessagePart } from "@/queries/chat/sendChat"
import {
  applyStreamEvent,
  streamChat,
  ChatStreamEvent,
} from "@/queries/chat/streamChat"
import { compressImage } from "@/utils/compressImage"
import { KEY as CHATS_KEY } from "@/queries/chat/useChats"
import { useMe } from "@/queries/auth/useMe"

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
  const { data: user } = useMe()

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
        // Stamp the chat with its owner so it lands in the user's scoped list.
        const userId = user?.id != null ? String(user.id) : undefined

        // Stream the reply into the assistant bubble, reducing each SSE event
        // into the message so text and tool activity render as they arrive.
        // The done event is kept on a holder object so its type survives the
        // callback closure (a bare `let` would collapse to its initial value).
        let assistant: ChatMessage = {
          id: assistantId,
          role: "assistant",
          pending: true,
        }
        const stream: { done: Extract<ChatStreamEvent, { type: "done" }> | null } = {
          done: null,
        }

        await streamChat(
          messages,
          (event) => {
            if (event.type === "done") stream.done = event
            assistant = applyStreamEvent(assistant, event)
            updateMessage(assistantId, assistant)
          },
          chatId,
          userId
        )

        const done = stream.done
        if (done && done.success && done.chatId) {
          useChatStore.getState().setChatId(done.chatId)
          // The conversation now exists server-side — surface it in the
          // chat page's sidebar.
          queryClient.invalidateQueries({ queryKey: [CHATS_KEY] })
        } else if (!done || !done.chatId) {
          // Only a missing chat id means the conversation is gone (deleted
          // elsewhere / foreign 404) — start fresh next send. A failure that
          // still returns a chatId (e.g. the credit limit) keeps the thread.
          useChatStore.getState().setChatId(null)
        }

        if (done && done.errorCode === "insufficient_credits") {
          toast.error("AI usage limit reached. Please try again later.")
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
    [addMessage, updateMessage, queryClient, user?.id]
  )
}
