import api from "@/utils/api"
import { BFF_BASE_URL } from "@/constants"
import { ServerChat } from "./types"

export const renameChat = async (
  chatId: string,
  title: string
): Promise<ServerChat> => {
  const { data } = await api.patch<{ success: boolean; data: ServerChat }>(
    `${BFF_BASE_URL}/ai/chats/${chatId}`,
    { title }
  )
  return data.data
}

export const deleteChat = async (chatId: string): Promise<void> => {
  await api.delete(`${BFF_BASE_URL}/ai/chats/${chatId}`)
}
