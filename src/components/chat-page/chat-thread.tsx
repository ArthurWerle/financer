"use client"

import { useEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { ChatMessage } from "@/stores/useChatStore"
import { ChatMessageBubble } from "@/components/chat/chat-message"

const LoadingSkeleton = () => (
  <div className="flex flex-col gap-3">
    <Skeleton className="h-10 w-3/5 self-end rounded-2xl" />
    <Skeleton className="h-16 w-4/5 rounded-2xl" />
    <Skeleton className="h-10 w-2/5 self-end rounded-2xl" />
    <Skeleton className="h-12 w-3/5 rounded-2xl" />
  </div>
)

const EmptyState = () => (
  <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
      <Sparkles className="h-6 w-6" />
    </div>
    <div>
      <p className="font-medium text-foreground">Start a conversation</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Ask about your finances, attach a receipt, or just say hi — every
        conversation is saved so you can pick it up later.
      </p>
    </div>
  </div>
)

type ChatThreadProps = {
  messages: ChatMessage[]
  isLoading: boolean
}

export const ChatThread = ({ messages, isLoading }: ChatThreadProps) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages])

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
      {isLoading ? (
        <LoadingSkeleton />
      ) : messages.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          {messages.map((message) => (
            <ChatMessageBubble key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  )
}
