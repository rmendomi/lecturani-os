import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { X, Volume2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ReadingKaraoke } from '@/components/ReadingKaraoke'
import { ReadingControls } from '@/components/ReadingControls'
import { SessionSummary } from '@/components/SessionSummary'
import { LoadingState } from '@/components/LoadingState'
import { useReadingSession } from '@/hooks/useReadingSession'
import { getStoryWithBlocks } from '@/services/storiesService'
import { getChild } from '@/services/childrenService'
import { useAuth } from '@/contexts/AuthContext'
import type { StoryWithBlocks, ChildProfile, StoryBlock } from '@/types/database'

function ChildWordCard({ block, showHint, childName }: {
  block: StoryBlock
  showHint: boolean
  childName: string
}) {
  const childWords = block.child_words ?? []
  const primaryWord = childWords[0] ?? block.text
  const syllableSupport = block.syllable_support
  const syllables = syllableSupport ? Object.values(syllableSupport).flat() : []

  return (
    <div className="bg-child/10 border-2 border-child/30 rounded-3xl p-5 space-y-3">
      <p className="text-xs font-bold text-child">Turno de {childName}</p>
      <div className="text-center">
        <p className="text-5xl font-black text-neutral-800 tracking-wide">{primaryWord}</p>
        {syllables.length > 0 && (
          <p className="text-2xl text-neutral-400 mt-2 tracking-widest">
            {syllables.join(' · ')}
          </p>
        )}
      </div>
      {showHint && block.hint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl px-4 py-3">
          <p className="text-sm text-yellow-800">💡 {block.hint}</p>
        </div>
      )}
    </div>
  )
}

interface ReadingContentProps {
  story: StoryWithBlocks
  child: ChildProfile | null
  userId: string
}

function ReadingContent({ story, child, userId }: ReadingContentProps) {
  const navigate = useNavigate()
  const session = useReadingSession(story, story.child_id, userId)
  const [sessionStarted, setSessionStarted] = useState(false)

  useEffect(() => {
    if (!sessionStarted) {
      session.start()
      setSessionStarted(true)
    }
  }, [sessionStarted, session])

  if (session.isComplete && session.summary) {
    return (
      <SessionSummary
        summary={session.summary}
        childName={child?.name ?? 'el niño'}
        storyTitle={story.title}
      />
    )
  }

  const { currentBlock, currentWordIndex, isChildBlock, showHint, setShowHint } = session
  if (!currentBlock) return <LoadingState />

  const childName = child?.name ?? 'tu niño'

  return (
    <AppShell hideNav>
      <div className="min-h-screen flex flex-col">
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex-1">
            <p className="text-xs text-neutral-400 font-medium">Leyendo con</p>
            <p className="font-bold text-neutral-800">{childName}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-neutral-300 px-3 py-1.5 bg-white rounded-full">
            <Volume2 className="w-3 h-3" />
            <span>Sin sonido</span>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="ml-2 w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-card"
          >
            <X className="w-5 h-5 text-neutral-400" />
          </button>
        </div>

        <div className="px-5 mb-2">
          <h2 className="text-sm font-bold text-neutral-600 line-clamp-1">{story.title}</h2>
          <div className="mt-1.5 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${(session.currentBlockIndex / story.blocks.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex-1 px-5 py-3 space-y-4 overflow-y-auto">
          {isChildBlock ? (
            <ChildWordCard block={currentBlock} showHint={showHint} childName={childName} />
          ) : (
            <ReadingKaraoke
              block={currentBlock}
              activeWordIndex={currentWordIndex}
              readWordCount={currentWordIndex}
            />
          )}

          {!isChildBlock && currentBlock.reader === 'adult' && (
            <div className="bg-neutral-50 rounded-2xl px-4 py-3">
              <p className="text-xs text-neutral-400 font-medium">Lee en voz alta para {childName}</p>
            </div>
          )}
        </div>

        <div className="px-5 pb-8 pt-4 space-y-3">
          <ReadingControls
            isChildTurn={isChildBlock}
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
