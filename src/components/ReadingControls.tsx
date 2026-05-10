import { CheckCircle, HelpCircle, SkipForward, ChevronRight, Lightbulb } from 'lucide-react'

interface ReadingControlsProps {
  isChildTurn: boolean
  showHint: boolean
  onNext: () => void
  onWordOk: () => void
  onWordHelp: () => void
  onWordSkip: () => void
  onToggleHint: () => void
  onFinish: () => void
}

export function ReadingControls({
  isChildTurn,
  showHint,
  onNext,
  onWordOk,
  onWordHelp,
  onWordSkip,
  onToggleHint,
  onFinish,
}: ReadingControlsProps) {
  if (isChildTurn) {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onWordOk}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-primary text-white font-semibold text-sm shadow-button active:scale-95 transition-all"
          >
            <CheckCircle className="w-6 h-6" />
            Lo leyó bien
          </button>
          <button
            onClick={onWordHelp}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-yellow-400 text-yellow-900 font-semibold text-sm active:scale-95 transition-all"
          >
            <HelpCircle className="w-6 h-6" />
            Con ayuda
          </button>
          <button
            onClick={onWordSkip}
            className="flex flex-col items-center gap-1.5 py-4 rounded-2xl bg-neutral-200 text-neutral-600 font-semibold text-sm active:scale-95 transition-all"
          >
            <SkipForward className="w-6 h-6" />
            Saltar
          </button>
        </div>
        <button
          onClick={onToggleHint}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 font-medium text-sm transition-all ${
            showHint
              ? 'border-accent bg-accent/10 text-primary'
              : 'border-neutral-200 text-neutral-500 hover:border-accent'
          }`}
        >
          <Lightbulb className="w-4 h-4" />
          {showHint ? 'Ocultar pista' : 'Mostrar pista'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={onNext}
        className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-button active:scale-95 transition-all"
      >
        Siguiente
        <ChevronRight className="w-5 h-5" />
      </button>
      <button
        onClick={onFinish}
        className="px-4 py-4 rounded-2xl border-2 border-neutral-200 text-neutral-500 font-medium text-sm active:scale-95 transition-all"
      >
        Terminar
      </button>
    </div>
  )
}
