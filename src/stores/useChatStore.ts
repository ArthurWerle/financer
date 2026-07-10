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
  open: () => void
  close: () => void
  toggle: () => void
  addMessage: (message: ChatMessage) => void
  updateMessage: (id: string, patch: Partial<ChatMessage>) => void
  reset: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  isOpen: false,
  messages: [],

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

  reset: () => set({ messages: [] }),
}))
