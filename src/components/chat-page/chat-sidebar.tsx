"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "react-toastify"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ServerChat } from "@/queries/chat/types"
import { renameChat, deleteChat } from "@/queries/chat/chatActions"
import { KEY as CHATS_KEY } from "@/queries/chat/useChats"
import { KEY as CHAT_KEY } from "@/queries/chat/useChat"

type ChatSidebarProps = {
  chats: ServerChat[]
  isLoading: boolean
  activeChatId?: string
  // Lets the mobile dialog close itself when a chat is picked.
  onNavigate?: () => void
}

export const ChatSidebar = ({
  chats,
  isLoading,
  activeChatId,
  onNavigate,
}: ChatSidebarProps) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [renameTarget, setRenameTarget] = useState<ServerChat | null>(null)
  const [renameTitle, setRenameTitle] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<ServerChat | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleRename = async () => {
    if (!renameTarget || !renameTitle.trim()) return
    setIsSaving(true)
    try {
      await renameChat(renameTarget.id, renameTitle.trim())
      queryClient.invalidateQueries({ queryKey: [CHATS_KEY] })
      queryClient.invalidateQueries({ queryKey: [CHAT_KEY, renameTarget.id] })
      setRenameTarget(null)
    } catch (error) {
      console.error(error)
      toast.error("Couldn't rename the chat. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setIsSaving(true)
    try {
      await deleteChat(deleteTarget.id)
      queryClient.invalidateQueries({ queryKey: [CHATS_KEY] })
      if (deleteTarget.id === activeChatId) {
        router.push("/chat")
      }
      setDeleteTarget(null)
    } catch (error) {
      console.error(error)
      toast.error("Couldn't delete the chat. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border p-3">
        <Button asChild variant="outline" className="w-full justify-start gap-2">
          <Link href="/chat" onClick={onNavigate}>
            <Plus className="h-4 w-4" />
            New chat
          </Link>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-1">
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-5 w-5" />
            No conversations yet
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {chats.map((chat) => (
              <li key={chat.id} className="group relative">
                <Link
                  href={`/chat/${chat.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "flex flex-col gap-0.5 rounded-lg px-3 py-2 pr-9 transition-colors hover:bg-muted",
                    chat.id === activeChatId && "bg-muted"
                  )}
                >
                  <span className="truncate text-sm text-foreground">
                    {chat.title ?? "New chat"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(chat.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Chat options"
                      className="absolute right-2 top-2.5 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-background hover:text-foreground focus:opacity-100 group-hover:opacity-100 data-[state=open]:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      onSelect={() => {
                        setRenameTitle(chat.title ?? "")
                        // Defer until the menu has fully closed so its focus
                        // return doesn't fight the dialog's focus trap.
                        setTimeout(() => setRenameTarget(chat), 0)
                      }}
                    >
                      <Pencil className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => setTimeout(() => setDeleteTarget(chat), 0)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Rename chat</DialogTitle>
          </DialogHeader>
          <Input
            value={renameTitle}
            onChange={(event) => setRenameTitle(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") handleRename()
            }}
            placeholder="Chat title"
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={isSaving || !renameTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete chat?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &quot;{deleteTarget?.title ?? "New chat"}&quot; and its messages
            will be removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSaving}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
