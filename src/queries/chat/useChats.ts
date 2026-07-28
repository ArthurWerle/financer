import { useQuery } from "@tanstack/react-query"
import api from "@/utils/api"
import { BFF_BASE_URL, CHAT_ORIGIN } from "@/constants"
import { useMe } from "@/queries/auth/useMe"
import { ServerChat } from "./types"

export const KEY = "/ai/chats"

type ChatsResponse = {
  success: boolean
  data: ServerChat[]
}

// All chats of the logged-in user, newest activity first (server-ordered).
// Scoped by userId (the owner stamped on chats at creation, see askQuestion) and
// by origin so this list only shows chats created from financer — chats from
// other services (e.g. uiless-financer) sharing the same user stay separate.
export const useChats = () => {
  const { data: user } = useMe()
  const userId = user?.id != null ? String(user.id) : undefined

  return useQuery<ServerChat[]>({
    queryKey: [KEY, userId],
    queryFn: () =>
      api
        .get<ChatsResponse>(`${BFF_BASE_URL}/ai/chats`, {
          params: { origin: CHAT_ORIGIN, ...(userId ? { userId } : {}) },
        })
        .then((res) => res.data.data),
    refetchOnWindowFocus: false,
  })
}
