import { useEffect, useRef } from "react"
import { Sparkles, X } from "lucide-react"
import { useChatStore } from "@/stores/useChatStore"
import { ChatMessageBubble } from "./chat-message"
import { ChatComposer } from "./chat-composer"
import { useSendChat } from "./useSendChat"

const SUGGESTIONS = [
  "How much did I spend this month?",
  "What are my biggest expenses?",
  "Scan a receipt to add it",
]

const EmptyState = () => {
  const send = useSendChat()

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
        <Sparkles className="h-6 w-6" />
      </div>
      <div>
        <p className="font-medium text-foreground">Financer Assistant</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask about your finances, or attach a receipt to log it automatically.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => send(suggestion, null)}
            className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  )
}

export const ChatPanel = () => {
  const messages = useChatStore((state) => state.messages)
  const close = useChatStore((state) => state.close)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-t-2xl bg-popover text-popover-foreground shadow-2xl sm:rounded-2xl sm:border sm:border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold">Assistant</span>
        </div>
        <button
          type="button"
          onClick={close}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close chat"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4">
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))}
          </div>
        )}
      </div>

      <ChatComposer />
    </div>
  )
}
