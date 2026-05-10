import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Mic, MicOff, Music2, VolumeX } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ReadingKaraoke } from '@/components/ReadingKaraoke'
import { ReadingControls } from '@/components/ReadingControls'
import { SessionSummary } from '@/components/SessionSummary'
import { StoryImage, buildImageUrl } from '@/components/StoryImage'
import { LoadingState } from '@/components/LoadingState'
import { useReadingSession } from '@/hooks/useReadingSession'
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition'
import { useAmbientMusic } from '@/hooks/useAmbientMusic'
import { getStoryWithBlocks } from '@/services/storiesService'
import { getChild } from '@/services/childrenService'
import { useAuth } from '@/contexts/AuthContext'
import type { StoryWithBlocks, ChildProfile } from '@/types/database'

interface ReadingContentProps {
  story: StoryWithBlocks
  child: ChildProfile | null
  userId: string
}

function ReadingContent({ story, child, userId }: ReadingContentProps) {
  const navigate = useNavigate()
  const session = useReadingSession(story, story.child_id, userId)
  const [sessionStarted, setSessionStarted] = useState(false)
  const music = useAmbientMusic(story.theme)

  useEffect(() => {
    if (!sessionStarted) {
      session.start()
      setSessionStarted(true)
    }
  }, [sessionStarted, session])

  const { currentBlock, currentWordIndex, isChildTurn, showHint, setShowHint } = session

  const blockWords = currentBlock?.text.split(/\s+/).filter(Boolean) ?? []
  const currentWord = blockWords[currentWordIndex] ?? ''
  const currentWordClean = currentWord.replace(/[.,!?;:]/g, '').toLowerCase()
  const syllablesForWord = currentBlock?.syllable_support?.[currentWordClean] ?? null

  const { isListening, isSupported, toggle: toggleMic } = useSpeechRecognition(
    session.handleNext,
    currentWord,
    !isChildTurn && !session.isComplete
  )

  if (session.isComplete && session.summary) {
    return (
      <SessionSummary
        summary={session.summary}
        childName={child?.name ?? 'el niño'}
        storyTitle={story.title}
      />
    )
  }

  if (!currentBlock) return <LoadingState />

  const childName = child?.name ?? 'tu niño'
  const nextBlock = story.blocks[session.currentBlockIndex + 1]

  return (
    <AppShell hideNav>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex-1">
            <p className="text-xs text-neutral-400 font-medium">Leyendo con</p>
            <p className="font-bold text-neutral-800">{childName}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón música */}
            <button
              onClick={music.toggle}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                music.isPlaying
                  ? 'bg-accent text-primary shadow-button'
                  : 'bg-white text-neutral-400 shadow-card'
              }`}
              title={music.isPlaying ? 'Pausar música' : 'Activar música'}
            >
              {music.isPlaying
                ? <Music2 className="w-3.5 h-3.5 animate-pulse" />
                : <VolumeX className="w-3.5 h-3.5" />
              }
              {music.isPlaying ? 'Música' : 'Silencio'}
            </button>

            {/* Botón micrófono */}
            {isSupported && (
              <button
                onClick={toggleMic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isListening
                    ? 'bg-primary text-white shadow-button'
                    : 'bg-white text-neutral-400 shadow-card'
                }`}
              >
                {isListening
                  ? <Mic className="w-3.5 h-3.5 animate-pulse" />
                  : <MicOff className="w-3.5 h-3.5" />
                }
                {isListening ? 'Escuchando' : 'Micrófono'}
              </button>
            )}

            {/* Botón cerrar */}
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-card"
            >
              <X className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="px-5 mb-2">
          <h2 className="text-sm font-bold text-neutral-600 line-clamp-1">{story.title}</h2>
          <div className="mt-1.5 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(session.currentBlockIndex / story.blocks.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 px-5 py-3 space-y-4 overflow-y-auto">
          {/* Ilustración del bloque actual */}
          <StoryImage
            text={currentBlock.text}
            seed={session.currentBlockIndex}
          />

          <ReadingKaraoke
            block={currentBlock}
            activeWordIndex={currentWordIndex}
            readWordCount={currentWordIndex}
            isMicActive={isListening && !isChildTurn}
          />

          {isChildTurn && showHint && syllablesForWord && syllablesForWord.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
              <p className="text-xl text-yellow-800 font-bold tracking-widest text-center">
                {syllablesForWord.map(s => s.replace(/-/g, ' · ')).join('  ')}
              </p>
            </div>
          )}

          {isChildTurn && !showHint && (
            <div className="bg-neutral-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-neutral-400 font-medium text-center">
                Pídele a {childName} que diga la palabra resaltada junto a ti
              </p>
            </div>
          )}

          {!isChildTurn && (
            <div className="bg-neutral-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-neutral-400 font-medium">
                {isListening
                  ? `🎤 El texto avanza automáticamente con el micrófono`
                  : `Lee en voz alta para ${childName} — activa el micrófono para avance automático`
                }
              </p>
            </div>
          )}
        </div>

        {/* Preload de la siguiente imagen */}
        {nextBlock && (
          <img
            src={buildImageUrl(nextBlock.text, session.currentBlockIndex + 1)}
            alt=""
            className="hidden"
            aria-hidden
          />
        )}

        {/* Controles */}
        <div className="px-5 pb-8 pt-4 space-y-3">
          <ReadingControls
            isChildTurn={isChildTurn}
            showHint={showHint}
            onNext={session.handleNext}
            onWordOk={session.handleWordOk}
            onWordHelp={session.handleWordHelp}
            onWordSkip={session.handleWordSkip}
            onToggleHint={() => setShowHint(!showHint)}
            onFinish={session.finish}
          />
        </div>
      </div>
    </AppShell>
  )
}

export function ReadingPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [story, setStory] = useState<StoryWithBlocks | null>(null)
  const [child, setChild] = useState<ChildProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getStoryWithBlocks(id).then(s => {
      setStory(s)
      if (s?.child_id) {
        getChild(s.child_id).then(setChild)
      }
      setIsLoading(false)
    })
  }, [id])

  if (isLoading || !story || !user) {
    return <LoadingState message="Preparando lectura..." />
  }

  return <ReadingContent story={story} child={child} userId={user.id} />
}
