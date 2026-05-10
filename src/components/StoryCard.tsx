import { useNavigate } from 'react-router-dom'
import { Clock, BookOpen, ChevronRight } from 'lucide-react'
import type { Story } from '@/types/database'
import { formatRelativeDate } from '@/utils/formatters'
import { getThemeLabel } from '@/utils/readingLevels'

interface StoryCardProps {
  story: Story
  childName?: string
  onRead?: (story: Story) => void
}

export function StoryCard({ story, childName, onRead }: StoryCardProps) {
  const navigate = useNavigate()

  const handleRead = () => {
    if (onRead) {
      onRead(story)
    } else {
      navigate(`/leer/${story.id}`)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-neutral-800 text-base leading-tight line-clamp-2">
              {story.title}
            </h3>
            {childName && (
              <p className="text-xs text-neutral-400 mt-0.5">Para {childName}</p>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-warm flex items-center justify-center text-xl flex-shrink-0">
            📖
          </div>
        </div>
        <div className="flex items-center gap-3 mt-3">
          {story.estimated_minutes && (
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <Clock className="w-3.5 h-3.5" />
              {story.estimated_minutes} min
            </span>
          )}
          {story.theme && (
            <span className="flex items-center gap-1 text-xs text-neutral-400">
              <BookOpen className="w-3.5 h-3.5" />
              {getThemeLabel(story.theme)}
            </span>
          )}
          <span className="text-xs text-neutral-300 ml-auto">
            {formatRelativeDate(story.created_at)}
          </span>
        </div>
      </div>
      <button
        onClick={handleRead}
        className="w-full bg-primary/5 hover:bg-primary/10 border-t border-neutral-100 py-3 px-4 flex items-center justify-center gap-2 transition-colors font-semibold text-primary text-sm"
      >
        Leer ahora
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}
