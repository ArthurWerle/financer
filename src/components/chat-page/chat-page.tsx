"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { PanelLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ChatComposer } from "@/components/chat/chat-composer"
import { useChats } from "@/queries/chat/useChats"
import { useChat } from "@/queries/chat/useChat"
import { toUiMessage } from "@/queries/chat/mapServerMessage"
import { ChatSidebar } from "./chat-sidebar"
import { ChatThread } from "./chat-thread"
import { useSendChatPage } from "./useSendChatPage"

// Full-page assistant: chat list on the left, active conversation on the
// right. Both /chat and /chat/:id render this same component (optional
// catch-all route), so starting a new conversation only swaps the URL via
// history.replaceState — the component never remounts mid-conversation.
const ChatPage = () => {
  const pathname = usePathname()
  const activeChatId = pathname.split("/")[2] || undefined
  const [mobileListOpen, setMobileListOpen] = useState(false)

  const chatsQuery = useChats()
  const chatQuery = useChat(activeChatId)
  const { send, isSending, pendingMessages } = useSendChatPage(activeChatId)

  const chats = chatsQuery.data ?? []
  const activeChat =
    chatQuery.data?.chat ?? chats.find((chat) => chat.id === activeChatId)
  const messages = [
    ...(chatQuery.data?.messages ?? []).map(toUiMessage),
    ...pendingMessages,
  ]

  const sidebar = (
    <ChatSidebar
      chats={chats}
      isLoading={chatsQuery.isLoading}
      activeChatId={activeChatId}
      onNavigate={() => setMobileListOpen(false)}
    />
  )

  return (
    <div className="flex h-[calc(100dvh-130px)] min-h-[400px] overflow-hidden rounded-xl border border-border bg-background">
      <aside className="hidden w-72 shrink-0 flex-col border-r border-border md:flex">
        {sidebar}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setMobileListOpen(true)}
            aria-label="Show chats"
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <span className="truncate text-sm font-medium">
            {activeChatId ? (activeChat?.title ?? "New chat") : "New chat"}
          </span>
        </div>

        {activeChatId && chatQuery.isError ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-muted-foreground">
              This chat could not be found. It may have been deleted.
            </p>
          </div>
        ) : (
          <ChatThread
            messages={messages}
            isLoading={!!activeChatId && chatQuery.isLoading}
          />
        )}

        <ChatComposer
          onSend={send}
          disabled={isSending || (!!activeChatId && chatQuery.isError)}
        />
      </section>

      <Dialog open={mobileListOpen} onOpenChange={setMobileListOpen}>
        <DialogContent className="h-[70dvh] max-w-sm overflow-hidden p-0">
          <DialogTitle className="sr-only">Chats</DialogTitle>
          {sidebar}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default ChatPage
