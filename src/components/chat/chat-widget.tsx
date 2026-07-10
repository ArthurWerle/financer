"use client"

import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { usePathname } from "next/navigation"
import { useChatStore } from "@/stores/useChatStore"
import { ChatPanel } from "./chat-panel"

const ChatWidget = () => {
  const pathname = usePathname()
  const isOpen = useChatStore((state) => state.isOpen)
  const toggle = useChatStore((state) => state.toggle)
  const close = useChatStore((state) => state.close)

  // Mirror the header: no assistant on the login screen.
  if (pathname === "/login") return null

  return (
    <>
      <AnimatePresence>
        {isOpen ? (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
              className="fixed inset-0 z-50 bg-black/30 sm:hidden"
            />
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className="fixed inset-x-0 bottom-0 z-50 h-[85dvh] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-8rem)] sm:w-[380px]"
            >
              <ChatPanel />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={toggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={isOpen ? "Close assistant" : "Open assistant"}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-shadow hover:shadow-xl"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isOpen ? "close" : "open"}
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.15 }}
          >
            {isOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <MessageCircle className="h-6 w-6" />
            )}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  )
}

export default ChatWidget
