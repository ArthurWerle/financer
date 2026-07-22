import { useQuery } from "@tanstack/react-query"
import api from "@/utils/api"
import { BFF_BASE_URL } from "@/constants"
import { useMe } from "@/queries/auth/useMe"
import { ServerChat } from "./types"

export const KEY = "/ai/chats"

type ChatsResponse = {
  success: boolean
  data: ServerChat[]
}

// All chats of the logged-in user, newest activity first (server-ordered).
// The list is scoped by userId so it matches the owner stamped on chats at
// creation time (see askQuestion) — otherwise widget/page chats never surface.
export const useChats = () => {
  const { data: user } = useMe()
  const userId = user?.id != null ? String(user.id) : undefined

  return useQuery<ServerChat[]>({
    queryKey: [KEY, userId],
    queryFn: () =>
      api
        .get<ChatsResponse>(`${BFF_BASE_URL}/ai/chats`, {
          params: userId ? { userId } : undefined,
        })
        .then((res) => res.data.data),
    refetchOnWindowFocus: false,
  })
}
