// Server-side chat rows as returned by ai-internal through the BFF
// (`/ai/chats` endpoints). Attachments store raw base64 without the
// "data:...;base64," prefix.

export type ServerChat = {
  id: string
  userId: string | null
  title: string | null
  createdAt: string
  updatedAt: string
}

export type ServerAttachment = {
  id: string
  messageId: string
  type: "image" | "audio"
  content: string
  mimeType: string | null
  createdAt: string
}

export type ServerChatMessage = {
  id: string
  chatId: string
  role: "user" | "assistant"
  content: string
  metadata: Record<string, unknown> | null
  createdAt: string
  attachments: ServerAttachment[]
}

export type ChatWithMessages = {
  chat: ServerChat
  messages: ServerChatMessage[]
}
