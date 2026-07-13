import { useQuery } from "@tanstack/react-query"
import api from "@/utils/api"
import { BFF_BASE_URL } from "@/constants"
import { ServerChat } from "./types"

export const KEY = "/ai/chats"

type ChatsResponse = {
  success: boolean
  data: ServerChat[]
}

// All chats of the logged-in user, newest activity first (server-ordered).
export const useChats = () => {
  return useQuery<ServerChat[]>({
    queryKey: [KEY],
    queryFn: () =>
      api
        .get<ChatsResponse>(`${BFF_BASE_URL}/ai/chats`)
        .then((res) => res.data.data),
    refetchOnWindowFocus: false,
  })
}
