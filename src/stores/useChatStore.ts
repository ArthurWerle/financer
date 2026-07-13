import { create } from 'zustand'

// A transaction created by the /scan endpoint. ai-internal passes the
// downstream object through untouched (.passthrough()), so keep this loose.
export type ScannedTransaction = {
  id?: string | number
  amount?: number
  value?: number
  type?: string
  description?: string
  date?: string
  location?: string
  error?: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  text?: string
  imageDataUrl?: string
  audioName?: string
  transactions?: ScannedTransaction[]
  pending?: boolean
  error?: boolean
}

type ChatState = {
  isOpen: boolean
  messages: ChatMessage[]
  // Server-side chat the widget conversation is persisted to; null until the
  // first successful /ask response creates one.
  chatId: string | null
  open: () => void
  close: () => void
  toggle: () => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void
  setChatId: (chatId: string | null) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],
  chatId: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  updateMessage: (id, patch) =>
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, ...patch } : message
      ),
    })),

  setChatId: (chatId) => set({ chatId }),

  reset: () => set({ messages: [], chatId: null }),
}))
