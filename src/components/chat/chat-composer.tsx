"use client"

import { useCallback, useRef, useState, useEffect } from "react"
import { FileAudio, Mic, Paperclip, Send, X } from "lucide-react"
import { toast } from "react-toastify"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition"
import { Attachment } from "./useSendChat"

type ChatComposerProps = {
  onSend: (text: string, attachment: Attachment | null) => void
  disabled?: boolean
}

export const ChatComposer = ({ onSend, disabled }: ChatComposerProps) => {
  const [text, setText] = useState("")
  const [attachment, setAttachment] = useState<Attachment | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  // Text already in the box when dictation starts, so speech is appended to it.
  const baseTextRef = useRef("")

  const handleTranscript = useCallback((transcript: string) => {
    const base = baseTextRef.current
    setText(base ? `${base} ${transcript}` : transcript)
  }, [])

  const handleSpeechError = useCallback((error: string) => {
    if (error === "not-allowed" || error === "service-not-allowed") {
      toast.error("Permita o acesso ao microfone para gravar áudio.")
    }
  }, [])

  const {
    isSupported: isMicSupported,
    isRecording,
    start: startRecording,
    stop: stopRecording,
  } = useSpeechRecognition({
    onResult: handleTranscript,
    onError: handleSpeechError,
  })

  const handleMic = () => {
    if (disabled) return
    if (isRecording) {
      stopRecording()
      return
    }
    baseTextRef.current = text.trim()
    startRecording()
  }

  // Auto-grow the textarea up to a cap, then let it scroll.
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [text])

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    const kind = file.type.startsWith("audio") ? "audio" : "image"
    if (kind === "image") {
      const reader = new FileReader()
      reader.onload = () =>
        setAttachment({ file, kind, previewUrl: reader.result as string })
      reader.readAsDataURL(file)
    } else {
      setAttachment({ file, kind })
    }
  }

  const handleSend = () => {
    if (disabled) return
    if (!text.trim() && !attachment) return
    if (isRecording) stopRecording()
    onSend(text, attachment)
    setText("")
    setAttachment(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="border-t border-border bg-background/80 p-3">
      {attachment ? (
        <div className="mb-2 flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-1.5 pr-2 text-xs">
          {attachment.kind === "image" && attachment.previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={attachment.previewUrl}
              alt="Attachment preview"
              className="h-9 w-9 rounded object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded bg-muted">
              <FileAudio className="h-4 w-4" />
            </span>
          )}
          <span className="flex-1 truncate text-muted-foreground">
            {attachment.file.name}
          </span>
          <button
            type="button"
            onClick={() => setAttachment(null)}
            className="rounded p-1 text-muted-foreground hover:text-foreground"
            aria-label="Remove attachment"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,audio/*"
          className="hidden"
          onChange={handleFile}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Add attachment"
        >
          <Paperclip className="h-5 w-5" />
        </Button>

        <Textarea
          ref={textareaRef}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder="Ask a question or attach a receipt…"
          className="max-h-[120px] min-h-[40px] flex-1 resize-none border-0 bg-transparent px-1 py-2 shadow-none focus-visible:ring-0"
        />

        {isMicSupported ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "shrink-0 text-muted-foreground",
              isRecording && "animate-pulse text-destructive"
            )}
            onClick={handleMic}
            disabled={disabled}
            aria-label={isRecording ? "Stop recording" : "Record audio"}
          >
            <Mic className="h-5 w-5" />
          </Button>
        ) : null}

        <Button
          type="button"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !attachment)}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
