import { useCallback, useState } from "react"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { ChatMessage } from "@/stores/useChatStore"
import { fileToBase64, MessagePart } from "@/queries/chat/sendChat"
import {
  applyStreamEvent,
  streamChat,
  ChatStreamEvent,
} from "@/queries/chat/streamChat"
import { KEY as CHATS_KEY } from "@/queries/chat/useChats"
import { KEY as CHAT_KEY } from "@/queries/chat/useChat"
import {
  ChatWithMessages,
  ServerAttachment,
  ServerChatMessage,
} from "@/queries/chat/types"
import { Attachment } from "@/components/chat/useSendChat"
import { useMe } from "@/queries/auth/useMe"

const ATTACHMENT_ONLY_PROMPT = "Please describe this attachment."

const createId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// In-flight bubbles are keyed by the chat they were sent from, so switching
// chats while a request is pending doesn't bleed them into another thread.
type PendingState = {
  chatKey: string
  messages: ChatMessage[]
}

// Send flow for the full chat page. Everything (text and attachments) goes
// through /ask so the whole conversation is persisted server-side. While the
// request is in flight the user message + a typing indicator are rendered
// locally; on success the exchange is written into the chat detail cache so
// the thread updates without a refetch, and the chat list is invalidated to
// pick up the new row / auto-generated title / reordering.
export const useSendChatPage = (activeChatId?: string) => {
  const queryClient = useQueryClient()
  const { data: user } = useMe()
  const [isSending, setIsSending] = useState(false)
  const [pending, setPending] = useState<PendingState | null>(null)

  const chatKey = activeChatId ?? "new"

  const send = useCallback(
    async (text: string, attachment: Attachment | null) => {
      const trimmed = text.trim()
      if (!trimmed && !attachment) return
      if (isSending) return

      const userMessage: ChatMessage = {
        id: createId(),
        role: "user",
        text: trimmed || undefined,
        imageDataUrl:
          attachment?.kind === "image" ? attachment.previewUrl : undefined,
        audioName:
          attachment?.kind === "audio" ? attachment.file.name : undefined,
      }
      const assistantId = createId()

      setIsSending(true)
      setPending({
        chatKey,
        messages: [userMessage, { id: assistantId, role: "assistant", pending: true }],
      })

      const failLocally = (message?: string) => {
        setPending({
          chatKey,
          messages: [
            userMessage,
            {
              id: assistantId,
              role: "assistant",
              error: true,
              text: message ?? "Something went wrong. Please try again.",
            },
          ],
        })
      }

      try {
        const base64 = attachment ? await fileToBase64(attachment.file) : null
        const content = trimmed || ATTACHMENT_ONLY_PROMPT
        const parts: MessagePart[] = [{ type: "text", content }]
        if (attachment && base64) {
          parts.push({ type: attachment.kind, content: base64 })
        }

        // Stamp the chat with its owner so it lands in the user's scoped list.
        const userId = user?.id != null ? String(user.id) : undefined

        // Stream the reply, reducing each SSE event into the in-flight
        // assistant bubble so text and tool activity render as they arrive.
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
          parts,
          (event) => {
            if (event.type === "done") stream.done = event
            assistant = applyStreamEvent(assistant, event)
            setPending({ chatKey, messages: [userMessage, assistant] })
          },
          activeChatId,
          userId
        )

        const done = stream.done
        if (!done || !done.success || !done.chatId) {
          // The reducer already rendered a clear error message (the credit-limit
          // notice or a generic failure) into the assistant bubble; leave that
          // bubble in place instead of overwriting it.
          if (done?.errorCode === "insufficient_credits") {
            toast.error("AI usage limit reached. Please try again later.")
          }
          return
        }

        const now = new Date().toISOString()
        const attachments: ServerAttachment[] = []
        if (attachment && base64) {
          attachments.push({
            id: createId(),
            messageId: "",
            type: attachment.kind,
            content: base64,
            mimeType: attachment.file.type || null,
            createdAt: now,
          })
        }

        // Synthetic rows shaped like the server's; real ids and rows land on
        // the next refetch (the detail query is marked stale below without an
        // immediate refetch, so the thread isn't re-keyed mid-view).
        const userRow: ServerChatMessage = {
          id: userMessage.id,
          chatId: done.chatId,
          role: "user",
          content,
          metadata: null,
          createdAt: now,
          attachments,
        }
        const assistantRow: ServerChatMessage = {
          id: assistantId,
          chatId: done.chatId,
          role: "assistant",
          content: done.answer ?? "",
          // Persist the tool names so the seeded bubble keeps its tool chips
          // (toUiMessage reads metadata.toolsUsed) without waiting for a refetch.
          metadata: done.toolsUsed?.length ? { toolsUsed: done.toolsUsed } : null,
          createdAt: now,
          attachments: [],
        }

        const chatId = done.chatId
        queryClient.setQueryData<ChatWithMessages>(
          [CHAT_KEY, chatId],
          (old) =>
            old
              ? { ...old, messages: [...old.messages, userRow, assistantRow] }
              : {
                  chat: {
                    id: chatId,
                    userId: null,
                    title: null,
                    createdAt: now,
                    updatedAt: now,
                  },
                  messages: [userRow, assistantRow],
                }
        )
        setPending(null)

        if (!activeChatId) {
          // First message of a new chat: reflect the server-assigned id in
          // the URL. replaceState keeps the page instance mounted (Next syncs
          // usePathname with the native history API), so the seeded cache
          // above renders without any flash or refetch.
          window.history.replaceState({}, "", `/chat/${chatId}`)
        }

        queryClient.invalidateQueries({ queryKey: [CHATS_KEY] })
        queryClient.invalidateQueries({
          queryKey: [CHAT_KEY, chatId],
          refetchType: "none",
        })
      } catch (error) {
        console.error(error)
        toast.error("Couldn't reach the assistant. Please try again.")
        failLocally()
      } finally {
        setIsSending(false)
      }
    },
    [activeChatId, chatKey, isSending, queryClient, user?.id]
  )

  return {
    send,
    isSending,
    pendingMessages: pending?.chatKey === chatKey ? pending.messages : [],
  }
}
