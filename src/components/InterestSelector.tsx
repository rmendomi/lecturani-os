import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { COMMON_INTERESTS } from '@/utils/readingLevels'

interface InterestSelectorProps {
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function InterestSelector({ value, onChange, error }: InterestSelectorProps) {
  const [custom, setCustom] = useState('')

  const toggle = (interest: string) => {
    if (value.includes(interest)) {
      onChange(value.filter(i => i !== interest))
    } else {
      onChange([...value, interest])
    }
  }

  const addCustom = () => {
    const trimmed = custom.trim().toLowerCase()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
      setCustom('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addCustom()
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {COMMON_INTERESTS.map(interest => (
          <button
            key={interest}
            type="button"
            onClick={() => toggle(interest)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              value.includes(interest)
                ? 'bg-primary text-white'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:border-primary/50'
            }`}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={e => setCustom(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Agregar interés personalizado..."
          className="flex-1 px-3 py-2 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={addCustom}
          className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {value.filter(i => !COMMON_INTERESTS.includes(i)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.filter(i => !COMMON_INTERESTS.includes(i)).map(interest => (
            <span key={interest} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium bg-accent/20 text-primary">
              {interest}
              <button type="button" onClick={() => toggle(interest)}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
