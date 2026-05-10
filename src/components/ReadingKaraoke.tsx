import { WordHighlight } from './WordHighlight'
import type { StoryBlock } from '@/types/database'

interface ReadingKaraokeProps {
  block: StoryBlock
  activeWordIndex: number
  readWordCount: number
}

export function ReadingKaraoke({ block, activeWordIndex, readWordCount }: ReadingKaraokeProps) {
  const words = block.text.split(/\s+/).filter(Boolean)
  const childWords = new Set((block.child_words ?? []).map(w => w.toLowerCase()))

  const isAdult = block.reader === 'adult'
  const isChild = block.reader === 'child'

  return (
    <div className={`rounded-3xl p-5 ${isChild ? 'bg-child/10 border-2 border-child/30' : isAdult ? 'bg-white border border-neutral-100' : 'bg-accent/10 border border-accent/30'}`}>
      {block.reader !== 'adult' && (
        <div className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${isChild ? 'text-child' : 'text-primary'}`}>
          {isChild ? '👦 Turno del niño' : '👨‍👩‍👦 Juntos'}
        </div>
      )}
      <p className="text-reading-md font-reading leading-relaxed">
        {words.map((word, idx) => {
          const clean = word.replace(/[.,!?;:]/g, '').toLowerCase()
          return (
            <WordHighlight
              key={idx}
              word={word}
              isActive={idx === activeWordIndex}
              isChildWord={childWords.has(clean)}
              isRead={idx < readWordCount}
            />
          )
        })}
      </p>
    </div>
  )
}
