import { useCallback, useEffect, useRef, useState } from 'react'

interface ISpeechRecognitionResult {
  readonly 0: { transcript: string }
}
interface ISpeechRecognitionResultList {
  readonly length: number
  item(index: number): ISpeechRecognitionResult
  [index: number]: ISpeechRecognitionResult
}
interface ISpeechRecognitionEvent extends Event {
  readonly resultIndex: number
  readonly results: ISpeechRecognitionResultList
}
interface ISpeechRecognitionErrorEvent extends Event {
  readonly error: string
}
interface ISpeechRecognition extends EventTarget {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  onresult: ((event: ISpeechRecognitionEvent) => void) | null
  onend: (() => void) | null
  onerror: ((event: ISpeechRecognitionErrorEvent) => void) | null
  start(): void
  stop(): void
}
type SpeechRecognitionCtor = new () => ISpeechRecognition

function normalizeWord(w: string): string {
  return w
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z]/g, '')
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    webkitSpeechRecognition?: SpeechRecognitionCtor
    SpeechRecognition?: SpeechRecognitionCtor
  }
  return w.webkitSpeechRecognition ?? w.SpeechRecognition ?? null
}

export const speechRecognitionSupported = getSpeechRecognition() !== null

export function useSpeechRecognition(
  onWordDetected: () => void,
  currentWord: string,
  active: boolean
) {
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<ISpeechRecognition | null>(null)
  const callbackRef = useRef(onWordDetected)
  const currentWordRef = useRef(currentWord)
  const activeRef = useRef(active)
  const shouldListenRef = useRef(false)
  const cooldownRef = useRef(false)

  callbackRef.current = onWordDetected
  currentWordRef.current = currentWord
  activeRef.current = active

  const stopRecognition = useCallback(() => {
    shouldListenRef.current = false
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setIsListening(false)
    cooldownRef.current = false
  }, [])

  const startRecognition = useCallback(() => {
    const SpeechRecognitionAPI = getSpeechRecognition()
    if (!SpeechRecognitionAPI || shouldListenRef.current) return

    const recognition = new SpeechRecognitionAPI()
    recognition.lang = 'es-CL'
    recognition.continuous = true
    recognition.interimResults = true
    recognition.maxAlternatives = 1

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      if (cooldownRef.current || !activeRef.current) return

      const target = normalizeWord(currentWordRef.current)
      if (!target) return

      // Revisar el resultado actual y el anterior para mayor velocidad
      const idxStart = Math.max(0, event.resultIndex - 1)
      for (let i = idxStart; i <= event.resultIndex; i++) {
        const normalized = normalizeWord(event.results[i][0].transcript)
        if (normalized.includes(target)) {
          cooldownRef.current = true
          callbackRef.current()
          setTimeout(() => { cooldownRef.current = false }, 150)
          break
        }
      }
    }

    recognition.onend = () => {
      if (shouldListenRef.current) {
        try { recognition.start() } catch { /* ignorar */ }
      }
    }

    recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        shouldListenRef.current = false
        setIsListening(false)
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    shouldListenRef.current = true
    setIsListening(true)
  }, [])

  const toggle = useCallback(() => {
    if (shouldListenRef.current) stopRecognition()
    else startRecognition()
  }, [startRecognition, stopRecognition])

  // Detener cuando pasa a turno del niño
  useEffect(() => {
    if (!active && shouldListenRef.current) {
      stopRecognition()
    }
  }, [active, stopRecognition])

  useEffect(() => () => stopRecognition(), [stopRecognition])

  return {
    isListening,
    isSupported: speechRecognitionSupported,
    toggle,
    stop: stopRecognition,
  }
}
