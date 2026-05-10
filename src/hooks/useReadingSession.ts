import { useState, useCallback, useRef } from 'react'
import type { StoryWithBlocks, SessionSummary } from '@/types/database'
import {
  createSession,
  completeSession,
  recordWordAttempt,
} from '@/services/readingSessionsService'
import { getReadingFeedback } from '@/services/aiService'

interface WordAttemptRecord {
  word: string
  status: 'ok' | 'help' | 'skipped'
  hintUsed: boolean
}

export function useReadingSession(story: StoryWithBlocks, childId: string, userId: string) {
  const [currentBlockIndex, setCurrentBlockIndex] = useState(0)
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const startTimeRef = useRef<number | null>(null)
  const attemptsRef = useRef<WordAttemptRecord[]>([])
  const sessionIdRef = useRef<string | null>(null)
  const storyRef = useRef(story)
  storyRef.current = story

  const currentBlock = story.blocks[currentBlockIndex]
  const isChildBlock = currentBlock?.reader === 'child'
  const blockWords = currentBlock?.text.split(/\s+/).filter(Boolean) ?? []
  const isLastWordInBlock = currentWordIndex >= blockWords.length - 1
  const isLastBlock = currentBlockIndex >= story.blocks.length - 1

  const currentWordClean = blockWords[currentWordIndex]?.replace(/[.,!?;:]/g, '').toLowerCase() ?? ''
  const childWordsSet = new Set((currentBlock?.child_words ?? []).map(w => w.toLowerCase()))
  const isCurrentWordChildWord = childWordsSet.size > 0 && childWordsSet.has(currentWordClean)

  // isChildTurn: true para bloques legacy reader:'child' O cuando la palabra activa es del niño
  const isChildTurn = isChildBlock || isCurrentWordChildWord

  // Fin de la frase del niño: busca cuántas palabras consecutivas son childWords
  const childPhraseEndIndex = (() => {
    if (!isCurrentWordChildWord) return currentWordIndex
    let end = currentWordIndex
    while (end + 1 < blockWords.length) {
      const nextClean = blockWords[end + 1]?.replace(/[.,!?;:]/g, '').toLowerCase() ?? ''
      if (!childWordsSet.has(nextClean)) break
      end++
    }
    return end
  })()

  const start = useCallback(async () => {
    const session = await createSession(userId, childId, story.id)
    sessionIdRef.current = session.id
    startTimeRef.current = Date.now()
  }, [userId, childId, story.id])

  const finish = useCallback(async () => {
    if (isProcessing || !sessionIdRef.current) return
    setIsProcessing(true)

    const durationSeconds = startTimeRef.current
      ? Math.round((Date.now() - startTimeRef.current) / 1000)
      : 0

    const attempts = attemptsRef.current
    const wordsOk = attempts.filter(a => a.status === 'ok').length
    const wordsHelp = attempts.filter(a => a.status === 'help').length
    const wordsSkipped = attempts.filter(a => a.status === 'skipped').length

    const feedback = await getReadingFeedback({
      wordsAttempted: attempts.length,
      wordsReadOk: wordsOk,
      wordsWithHelp: wordsHelp,
      wordsSkipped,
      childAge: 6,
      readingLevel: storyRef.current.reading_level ?? 'inicial',
    })

    const sessionSummary: SessionSummary = {
      wordsAttempted: attempts.length,
      wordsReadOk: wordsOk,
      wordsWithHelp: wordsHelp,
      wordsSkipped,
      durationSeconds,
      recommendation: feedback.recommendation,
      encouragement: feedback.encouragement,
    }

    await completeSession(sessionIdRef.current, {
      durationSeconds,
      wordsAttempted: attempts.length,
      wordsReadOk: wordsOk,
      wordsWithHelp: wordsHelp,
      wordsSkipped,
      summary: sessionSummary,
    })

    setSummary(sessionSummary)
    setIsComplete(true)
    setIsProcessing(false)
  }, [isProcessing])

  const finishRef = useRef(finish)
  finishRef.current = finish

  const advanceWord = useCallback((
    lastWordInBlock: boolean,
    lastBlock: boolean,
    nextWordIndex?: number
  ) => {
    setShowHint(false)
    if (!lastWordInBlock) {
      if (nextWordIndex !== undefined) {
        setCurrentWordIndex(nextWordIndex)
      } else {
        setCurrentWordIndex(prev => prev + 1)
      }
    } else if (!lastBlock) {
      setCurrentBlockIndex(prev => prev + 1)
      setCurrentWordIndex(0)
    } else {
      finishRef.current()
    }
  }, [])

  const handleWordOk = useCallback(async () => {
    if (!sessionIdRef.current || !currentBlock || !isChildTurn) return
    const phraseWords = blockWords.slice(currentWordIndex, childPhraseEndIndex + 1)
    for (const w of phraseWords) {
      attemptsRef.current.push({ word: w, status: 'ok', hintUsed: showHint })
      await recordWordAttempt(sessionIdRef.current, w, 'ok', showHint)
    }
    const phraseIsLast = childPhraseEndIndex >= blockWords.length - 1
    advanceWord(phraseIsLast, isLastBlock, phraseIsLast ? undefined : childPhraseEndIndex + 1)
  }, [currentBlock, isChildTurn, blockWords, currentWordIndex, childPhraseEndIndex, showHint, advanceWord, isLastBlock])

  const handleWordHelp = useCallback(async () => {
    if (!sessionIdRef.current || !currentBlock || !isChildTurn) return
    const phraseWords = blockWords.slice(currentWordIndex, childPhraseEndIndex + 1)
    for (const w of phraseWords) {
      attemptsRef.current.push({ word: w, status: 'help', hintUsed: showHint })
      await recordWordAttempt(sessionIdRef.current, w, 'help', showHint)
    }
    const phraseIsLast = childPhraseEndIndex >= blockWords.length - 1
    advanceWord(phraseIsLast, isLastBlock, phraseIsLast ? undefined : childPhraseEndIndex + 1)
  }, [currentBlock, isChildTurn, blockWords, currentWordIndex, childPhraseEndIndex, showHint, advanceWord, isLastBlock])

  const handleWordSkip = useCallback(async () => {
    if (!sessionIdRef.current || !currentBlock || !isChildTurn) return
    const phraseWords = blockWords.slice(currentWordIndex, childPhraseEndIndex + 1)
    for (const w of phraseWords) {
      attemptsRef.current.push({ word: w, status: 'skipped', hintUsed: showHint })
      await recordWordAttempt(sessionIdRef.current, w, 'skipped', showHint)
    }
    const phraseIsLast = childPhraseEndIndex >= blockWords.length - 1
    advanceWord(phraseIsLast, isLastBlock, phraseIsLast ? undefined : childPhraseEndIndex + 1)
  }, [currentBlock, isChildTurn, blockWords, currentWordIndex, childPhraseEndIndex, showHint, advanceWord, isLastBlock])

  const handleNext = useCallback(() => {
    advanceWord(isLastWordInBlock, isLastBlock)
  }, [isLastBlock, isLastWordInBlock, advanceWord])

  return {
    currentBlock,
    currentBlockIndex,
    currentWordIndex,
    isChildBlock,
    isChildTurn,
    isCurrentWordChildWord,
    childPhraseEndIndex,
    isLastBlock,
    showHint,
    setShowHint,
    isComplete,
    summary,
    isProcessing,
    start,
    handleNext,
    handleWordOk,
    handleWordHelp,
    handleWordSkip,
    finish,
  }
}
