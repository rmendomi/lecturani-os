import { useNavigate } from 'react-router-dom'
import { ChevronRight, BookOpen } from 'lucide-react'
import type { ChildProfile } from '@/types/database'
import { READING_LEVELS } from '@/utils/readingLevels'

interface ChildProfileCardProps {
  child: ChildProfile
  onSelect?: (child: ChildProfile) => void
  sessionCount?: number
}

const CHILD_EMOJIS = ['🦁', '🐨', '🦊', '🐸', '🦄', '🐬', '🦋', '🐼']

function getChildEmoji(id: string): string {
  const index = id.charCodeAt(0) % CHILD_EMOJIS.length
  return CHILD_EMOJIS[index]
}

export function ChildProfileCard({ child, onSelect, sessionCount }: ChildProfileCardProps) {
  const navigate = useNavigate()
  const level = READING_LEVELS[child.reading_level]
  const emoji = getChildEmoji(child.id)

  const handleClick = () => {
    if (onSelect) {
      onSelect(child)
    } else {
      navigate(`/ninos/${child.id}`)
    }
  }

  return (
    <button
      onClick={handleClick}
      className="w-full bg-white rounded-2xl p-4 shadow-card border border-neutral-100 flex items-center gap-4 hover:shadow-warm transition-all active:scale-98 text-left"
    >
      <div className="w-14 h-14 rounded-2xl bg-warm flex items-center justify-center text-2xl flex-shrink-0">
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-neutral-800 text-base">{child.name}</h3>
        <p className="text-xs text-neutral-400">{child.age} años</p>
        <div className="mt-1.5 flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${level?.color ?? 'bg-gray-100 text-gray-600'}`}>
            {level?.label ?? child.reading_level}
          </span>
          {sessionCount !== undefined && (
            <span className="text-xs text-neutral-400 flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {sessionCount} lecturas
            </span>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-neutral-300 flex-shrink-0" />
    </button>
  )
}
