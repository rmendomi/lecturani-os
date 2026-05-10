import type { ReadingLevel } from '@/types/database'
import { READING_LEVELS } from '@/utils/readingLevels'

interface DifficultySelectorProps {
  value: ReadingLevel | ''
  onChange: (value: ReadingLevel) => void
  error?: string
}

export function DifficultySelector({ value, onChange, error }: DifficultySelectorProps) {
  const levels = Object.entries(READING_LEVELS) as [ReadingLevel, typeof READING_LEVELS[ReadingLevel]][]

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {levels.map(([key, info]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`p-3 rounded-2xl border-2 text-left transition-all ${
              value === key
                ? 'border-primary bg-primary/5'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full inline-block mb-1 ${info.color}`}>
              {info.label}
            </div>
            <p className="text-xs text-neutral-500 leading-snug">{info.description}</p>
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
