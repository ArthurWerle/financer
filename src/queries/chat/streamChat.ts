import { BFF_BASE_URL, CHAT_ORIGIN } from "@/constants"
import { handleSessionExpiry } from "@/utils/api"
import { ChatMessage } from "@/stores/useChatStore"
import { MessagePart } from "./sendChat"

// Events streamed from the BFF /ai/ask/stream endpoint over SSE. `token` frames
// carry the answer piece by piece; `tool_start`/`tool_end` announce each tool
// (or MCP) call; the terminal `done` frame carries the same fields the
// non-streaming /ask response has (chatId, answer, toolsUsed, errorCode).
export type ChatStreamEvent =
  | { type: "token"; value: string }
  | { type: "tool_start"; name: string; args?: unknown }
  | { type: "tool_end"; name: string }
  | {
      type: "done"
      success?: boolean
      chatId?: string
      answer?: string
      toolsUsed?: string[]
      error?: string
      errorCode?: string
    }

// Folds a streamed event into the assistant ChatMessage being rendered. Kept
// pure so both send hooks (widget + page) share identical streaming behaviour
// and it stays easy to unit test.
export const applyStreamEvent = (
  message: ChatMessage,
  event: ChatStreamEvent
): ChatMessage => {
  switch (event.type) {
    case "token":
      return {
        ...message,
        pending: false,
        streaming: true,
        error: false,
        text: (message.text ?? "") + event.value,
      }

    case "tool_start":
      return {
        ...message,
        pending: false,
        streaming: true,
        tools: [...(message.tools ?? []), { name: event.name, status: "running" }],
      }

    case "tool_end": {
      const tools = [...(message.tools ?? [])]
      // Close the most recent still-running call with this name.
      for (let i = tools.length - 1; i >= 0; i--) {
        if (tools[i].name === event.name && tools[i].status === "running") {
          tools[i] = { ...tools[i], status: "done" }
          break
        }
      }
      return { ...message, tools }
    }

    case "done": {
      const tools = (message.tools ?? []).map((tool) =>
        tool.status === "running" ? { ...tool, status: "done" as const } : tool
      )
      const isError = event.success === false
      const answer =
        event.answer && event.answer.trim().length ? event.answer : undefined
      // A machine-readable code (e.g. "insufficient_credits") or a synthetic
      // transport code is not for display; a plain server message (e.g. "Chat
      // not found") is. Prefer the answer, then a human-readable error, then
      // whatever text already streamed in, then a generic fallback.
      const humanError =
        !event.errorCode &&
        event.error &&
        event.error !== "request_failed" &&
        event.error !== "unauthorized"
          ? event.error
          : undefined
      const fallback = isError
        ? "Something went wrong. Please try again."
        : undefined
      return {
        ...message,
        pending: false,
        streaming: false,
        error: isError,
        // The final answer is authoritative — it replaces the streamed text so
        // display and persistence converge (usually identical, so no flicker).
        text: answer ?? humanError ?? message.text ?? fallback,
        tools: tools.length ? tools : message.tools,
      }
    }
  }
}

// Splits an SSE buffer into complete `data:` frames, parsing each JSON payload.
// Returns the parsed events and the leftover (incomplete) buffer tail.
export const parseSseBuffer = (
  buffer: string
): { events: ChatStreamEvent[]; rest: string } => {
  const events: ChatStreamEvent[] = []
  let rest = buffer
  let separator = rest.indexOf("\n\n")
  while (separator !== -1) {
    const frame = rest.slice(0, separator)
    rest = rest.slice(separator + 2)
    separator = rest.indexOf("\n\n")

    for (const line of frame.split("\n")) {
      if (!line.startsWith("data:")) continue
      const payload = line.slice(5).trim()
      if (!payload) continue
      try {
        events.push(JSON.parse(payload) as ChatStreamEvent)
      } catch {
        // Ignore malformed frames rather than aborting the whole stream.
      }
    }
  }
  return { events, rest }
}

// Opens the streaming /ask endpoint and invokes onEvent for every parsed SSE
// event, resolving when the stream ends. Uses fetch (not the axios instance)
// because the browser streams a ReadableStream body; a non-OK response (a
// pre-stream JSON error like a 404 or the 402 credit limit) is surfaced as a
// synthetic `done` event so callers have a single code path.
export const streamChat = async (
  messages: MessagePart[],
  onEvent: (event: ChatStreamEvent) => void,
  chatId?: string,
  userId?: string
): Promise<void> => {
  const response = await fetch(`${BFF_BASE_URL}/ai/ask/stream`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      origin: CHAT_ORIGIN,
      ...(chatId ? { chatId } : {}),
      ...(userId ? { userId } : {}),
    }),
  })

  if (response.status === 401) {
    // Mirror the axios interceptor: a dead session clears the cookie and bounces
    // to /login instead of leaving the chat hanging.
    handleSessionExpiry()
    onEvent({ type: "done", success: false, error: "unauthorized" })
    return
  }

  const contentType = response.headers.get("content-type") ?? ""
  if (!response.ok || !response.body || !contentType.includes("text/event-stream")) {
    // Pre-stream error: parse the JSON body and replay it as a done event.
    let data: Partial<Extract<ChatStreamEvent, { type: "done" }>> = {}
    try {
      data = (await response.json()) as typeof data
    } catch {
      // No/invalid JSON body — fall through to a generic failure.
    }
    onEvent({
      type: "done",
      success: false,
      chatId: data.chatId,
      answer: data.answer,
      error: data.error ?? "request_failed",
      errorCode: data.errorCode,
    })
    return
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    const { events, rest } = parseSseBuffer(buffer)
    buffer = rest
    for (const event of events) onEvent(event)
  }
}
