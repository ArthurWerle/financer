import { useQuery } from "@tanstack/react-query"
import api from "@/utils/api"
import { BFF_BASE_URL } from "@/constants"
import { ChatWithMessages } from "./types"

export const KEY = "/ai/chats/detail"

type ChatResponse = {
  success: boolean
  data: ChatWithMessages
}

// A single chat with its full message history (oldest first).
export const useChat = (chatId?: string) => {
  return useQuery<ChatWithMessages>({
    queryKey: [KEY, chatId],
    queryFn: () =>
      api
        .get<ChatResponse>(`${BFF_BASE_URL}/ai/chats/${chatId}`)
        .then((res) => res.data.data),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  })
}
