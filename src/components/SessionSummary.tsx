import { useNavigate } from 'react-router-dom'
import { Star, Clock, Target, Heart } from 'lucide-react'
import { formatDuration } from '@/utils/formatters'
import type { SessionSummary as SessionSummaryType } from '@/types/database'

interface SessionSummaryProps {
  summary: SessionSummaryType
  childName: string
  storyTitle: string
}

export function SessionSummary({ summary, childName, storyTitle }: SessionSummaryProps) {
  const navigate = useNavigate()
  const successRate = summary.wordsAttempted > 0
    ? Math.round((summary.wordsReadOk / summary.wordsAttempted) * 100)
    : 0

  return (
    <div className="min-h-screen bg-warm flex flex-col px-5 py-8 gap-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="text-5xl">🎉</div>
        <h1 className="text-2xl font-black text-primary">¡Muy bien!</h1>
        <p className="text-neutral-600 text-sm">
          Hoy leyeron juntos <strong>"{storyTitle}"</strong>
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-card space-y-4">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Clock className="w-5 h-5" />
          <span>Tiempo juntos</span>
        </div>
        <p className="text-4xl font-black text-primary">
          {formatDuration(summary.durationSeconds)}
        </p>
      </div>

      <div className="bg-white rounded-3xl p-5 shadow-card space-y-3">
        <div className="flex items-center gap-2 text-primary font-bold mb-2">
          <Target className="w-5 h-5" />
          <span>Palabras de {childName}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-primary/5 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-primary">{summary.wordsAttempted}</p>
            <p className="text-xs text-neutral-500 mt-0.5">intentadas</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-green-600">{summary.wordsReadOk}</p>
            <p className="text-xs text-neutral-500 mt-0.5">sin ayuda</p>
          </div>
          <div className="bg-yellow-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-yellow-600">{summary.wordsWithHelp}</p>
            <p className="text-xs text-neutral-500 mt-0.5">con apoyo</p>
          </div>
          <div className="bg-neutral-50 rounded-2xl p-3 text-center">
            <p className="text-2xl font-black text-neutral-400">{summary.wordsSkipped}</p>
            <p className="text-xs text-neutral-500 mt-0.5">saltadas</p>
          </div>
        </div>
        {summary.wordsAttempted > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-xs text-neutral-500 mb-1">
              <span>Éxito independiente</span>
              <span className="font-bold text-primary">{successRate}%</span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-1000"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-accent/20 rounded-3xl p-5 space-y-2">
        <div className="flex items-center gap-2 text-primary font-bold">
          <Star className="w-5 h-5" />
          <span>Recomendación</span>
        </div>
        <p className="text-sm text-neutral-700 leading-relaxed">{summary.recommendation}</p>
      </div>

      <div className="bg-primary/5 rounded-3xl p-5 flex gap-3">
        <Heart className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-neutral-700 leading-relaxed italic">{summary.encouragement}</p>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-button active:scale-95 transition-all"
        >
          Volver al inicio
        </button>
        <button
          onClick={() => navigate('/biblioteca')}
          className="w-full py-3 rounded-2xl border-2 border-neutral-200 text-neutral-600 font-semibold text-sm active:scale-95 transition-all"
        >
          Ver biblioteca
        </button>
      </div>
    </div>
  )
}
