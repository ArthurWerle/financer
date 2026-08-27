import { ChatMessage, ChatToolCall } from "@/stores/useChatStore"
import { ServerChatMessage } from "./types"

// Pulls the tool names ai-internal persisted in the assistant message metadata
// (metadata.toolsUsed) so a resumed conversation shows the same tool chips the
// live stream did. All calls are already finished, hence status "done".
const toolsFromMetadata = (
  metadata: Record<string, unknown> | null
): ChatToolCall[] | undefined => {
  const used = metadata?.toolsUsed
  if (!Array.isArray(used)) return undefined
  const tools = used
    .filter((name): name is string => typeof name === "string")
    .map((name) => ({ name, status: "done" as const }))
  return tools.length ? tools : undefined
}

// Maps a persisted ai-internal message to the shape ChatMessageBubble
// renders. Server attachments store raw base64 (no "data:" prefix) and
// mimeType is not persisted by /ask today, so images fall back to
// image/jpeg — browsers content-sniff <img> data URLs, so PNGs still
// render. Audio filenames aren't persisted either, so a generic label
// is shown for resumed conversations.
export const toUiMessage = (message: ServerChatMessage): ChatMessage => {
  const image = message.attachments.find((a) => a.type === "image")
  const audio = message.attachments.find((a) => a.type === "audio")

  return {
    id: message.id,
    role: message.role,
    text: message.content || undefined,
    imageDataUrl: image
      ? `data:${image.mimeType ?? "image/jpeg"};base64,${image.content}`
      : undefined,
    audioName: audio ? "Audio message" : undefined,
    tools: message.role === "assistant" ? toolsFromMetadata(message.metadata) : undefined,
  }
}
