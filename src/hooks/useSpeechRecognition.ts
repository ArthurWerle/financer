'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

type UseSpeechRecognitionOptions = {
  // BCP-47 language tag used for recognition (defaults to Brazilian Portuguese)
  lang?: string
  // Called with the full session transcript (final + interim) as it grows
  onResult: (transcript: string) => void
  // Called with the raw error code (e.g. "not-allowed", "no-speech")
  onError?: (error: string) => void
}

const getSpeechRecognition = (): SpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
}

// Wraps the browser Web Speech API for dictation: start/stop recording and
// receive the live transcript. Support is browser-dependent (great in
// Chrome/Edge, partial in Safari, absent in Firefox), so callers should hide
// the entry point when `isSupported` is false.
export const useSpeechRecognition = ({
  lang = 'pt-BR',
  onResult,
  onError,
}: UseSpeechRecognitionOptions) => {
  const [isSupported, setIsSupported] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  // Keep the latest callbacks without re-creating the recognition instance.
  const onResultRef = useRef(onResult)
  const onErrorRef = useRef(onError)
  onResultRef.current = onResult
  onErrorRef.current = onError

  useEffect(() => {
    setIsSupported(getSpeechRecognition() !== null)
  }, [])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    if (recognitionRef.current) return

    const SpeechRecognitionCtor = getSpeechRecognition()
    if (!SpeechRecognitionCtor) return

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true

    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        const transcript = result[0].transcript
        if (result.isFinal) {
          finalTranscript += transcript
        } else {
          interim += transcript
        }
      }
      onResultRef.current(finalTranscript + interim)
    }

    recognition.onerror = (event) => {
      onErrorRef.current?.(event.error)
    }

    recognition.onend = () => {
      recognitionRef.current = null
      setIsRecording(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsRecording(true)
  }, [lang])

  // Abort any active recognition when the consumer unmounts.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  return { isSupported, isRecording, start, stop }
}
