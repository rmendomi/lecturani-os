import { Mic } from 'lucide-react'
import { WordHighlight } from './WordHighlight'
import type { StoryBlock } from '@/types/database'

interface ReadingKaraokeProps {
  block: StoryBlock
  activeWordIndex: number
  readWordCount: number
  isMicActive?: boolean
}

export function ReadingKaraoke({ block, activeWordIndex, readWordCount, isMicActive }: ReadingKaraokeProps) {
  const words = block.text.split(/\s+/).filter(Boolean)
  const isAdult = block.reader === 'adult'
  const isChild = block.reader === 'child'

  // En bloques del niño sin child_words explícitas, todas las palabras son del niño
  const explicitChildWords = block.child_words ?? []
  const childWordsSet = explicitChildWords.length > 0
    ? new Set(explicitChildWords.map(w => w.toLowerCase()))
    : null

  const activeWord = words[activeWordIndex]?.replace(/[.,!?;:]/g, '')

  return (
    <div className={`rounded-3xl p-5 space-y-3 ${isChild ? 'bg-child/10 border-2 border-child/30' : isAdult ? 'bg-white border border-neutral-100' : 'bg-accent/10 border border-accent/30'}`}>
      {block.reader !== 'adult' && (
        <div className={`text-xs font-bold flex items-center gap-1.5 ${isChild ? 'text-child' : 'text-primary'}`}>
          {isChild ? '👦 Turno del niño' : '👨‍👩‍👦 Juntos'}
        </div>
      )}
      <p className="font-reading leading-loose">
        {words.map((word, idx) => {
          const clean = word.replace(/[.,!?;:]/g, '').toLowerCase()
          const isChildWord = isChild
            ? (childWordsSet ? childWordsSet.has(clean) : true)
            : (childWordsSet?.has(clean) ?? false)
          return (
            <WordHighlight
              key={idx}
              word={word}
              isActive={idx === activeWordIndex}
              isChildWord={isChildWord}
              isRead={idx < readWordCount}
              isMicActive={isMicActive}
            />
          )
        })}
      </p>
      {isMicActive && activeWord && (
        <div className="flex items-center gap-2 pt-2 border-t border-neutral-100">
          <Mic className="w-3.5 h-3.5 text-primary animate-pulse flex-shrink-0" />
          <span className="text-xs text-neutral-400">
            Escuchando: <span className="font-bold text-primary">{activeWord}</span>
          </span>
        </div>
      )}
    </div>
  )
}
