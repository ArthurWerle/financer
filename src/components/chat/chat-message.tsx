import { motion } from "framer-motion"
import { AlertCircle, FileAudio, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Markdown } from "@/components/markdown"
import { ChatMessage, ScannedTransaction } from "@/stores/useChatStore"

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
})

const formatAmount = (transaction: ScannedTransaction) => {
  const raw = transaction.amount ?? transaction.value
  if (typeof raw !== "number") return null
  return currency.format(raw)
}

const TypingDots = () => (
  <div className="flex items-center gap-1 py-1" aria-label="Assistant is typing">
    {[0, 1, 2].map((index) => (
      <motion.span
        key={index}
        className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60"
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1, repeat: Infinity, delay: index * 0.15 }}
      />
    ))}
  </div>
)

const TransactionList = ({
  transactions,
}: {
  transactions: ScannedTransaction[]
}) => (
  <ul className="mt-2 flex flex-col gap-1.5">
    {transactions.map((transaction, index) => {
      const amount = formatAmount(transaction)
      return (
        <li
          key={transaction.id ?? index}
          className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 px-2.5 py-1.5 text-xs"
        >
          <span className="truncate text-foreground">
            {transaction.description ?? "Transaction"}
            {transaction.location ? (
              <span className="text-muted-foreground"> · {transaction.location}</span>
            ) : null}
          </span>
          {amount ? (
            <span className="shrink-0 font-medium tabular-nums">{amount}</span>
          ) : transaction.error ? (
            <span className="shrink-0 text-destructive">failed</span>
          ) : null}
        </li>
      )
    })}
  </ul>
)

export const ChatMessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === "user"

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex w-full gap-2", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser ? (
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </div>
      ) : null}

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm",
          isUser
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm bg-muted text-foreground",
          message.error && "bg-destructive/10 text-destructive"
        )}
      >
        {message.imageDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={message.imageDataUrl}
            alt="Attachment"
            className="mb-2 max-h-48 w-full rounded-lg object-cover"
          />
        ) : null}

        {message.audioName ? (
          <div className="mb-1 flex items-center gap-1.5 text-xs opacity-90">
            <FileAudio className="h-3.5 w-3.5" />
            <span className="truncate">{message.audioName}</span>
          </div>
        ) : null}

        {message.pending ? (
          <TypingDots />
        ) : (
          <>
            {message.error ? (
              <span className="mr-1 inline-flex align-[-2px]">
                <AlertCircle className="h-4 w-4" />
              </span>
            ) : null}
            {message.text ? (
              isUser ? (
                <span className="whitespace-pre-wrap break-words">{message.text}</span>
              ) : (
                <Markdown>{message.text}</Markdown>
              )
            ) : null}
          </>
        )}

        {message.transactions && message.transactions.length > 0 ? (
          <TransactionList transactions={message.transactions} />
        ) : null}
      </div>
    </motion.div>
  )
}
