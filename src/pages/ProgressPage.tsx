import { useEffect, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { LoadingState } from '@/components/LoadingState'
import { useChildren } from '@/hooks/useChildren'
import { getSessionsByChild } from '@/services/readingSessionsService'
import { formatDuration, formatRelativeDate } from '@/utils/formatters'
import type { ReadingSession } from '@/types/database'

export function ProgressPage() {
  const { children, isLoading: loadingChildren } = useChildren()
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [sessions, setSessions] = useState<ReadingSession[]>([])
  const [loadingSessions, setLoadingSessions] = useState(false)

  useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0].id)
    }
  }, [children, selectedChild])

  useEffect(() => {
    if (!selectedChild) return
    setLoadingSessions(true)
    getSessionsByChild(selectedChild)
      .then(setSessions)
      .finally(() => setLoadingSessions(false))
  }, [selectedChild])

  const child = children.find(c => c.id === selectedChild)
  const totalOk = sessions.reduce((acc, s) => acc + s.words_read_ok, 0)
  const totalMins = Math.round(sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60)

  if (loadingChildren) return <LoadingState />

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-5">
        <h1 className="text-2xl font-black text-neutral-800">Progreso</h1>

        {children.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {children.map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedChild(c.id)}
                className={`px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap transition-all ${
                  selectedChild === c.id
                    ? 'bg-primary text-white'
                    : 'bg-white border border-neutral-200 text-neutral-600'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}

        {child && (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-2xl p-4 shadow-card text-center">
              <p className="text-2xl font-black text-primary">{sessions.length}</p>
              <p className="text-xs text-neutral-400 mt-1">lecturas</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card text-center">
              <p className="text-2xl font-black text-primary">{totalMins}</p>
              <p className="text-xs text-neutral-400 mt-1">minutos</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-card text-center">
              <p className="text-2xl font-black text-primary">{totalOk}</p>
              <p className="text-xs text-neutral-400 mt-1">palabras</p>
            </div>
          </div>
        )}

        {loadingSessions ? (
          <LoadingState size="sm" />
        ) : sessions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📖</p>
            <p className="text-neutral-500">Sin sesiones aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h2 className="font-bold text-neutral-700 text-sm">Historial</h2>
            {sessions.map(session => (
              <div key={session.id} className="bg-white rounded-2xl p-4 shadow-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-neutral-700">
                    {formatRelativeDate(session.completed_at ?? session.started_at)}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {formatDuration(session.duration_seconds ?? 0)}
                  </span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span className="text-green-600 font-medium">✓ {session.words_read_ok} ok</span>
                  <span className="text-yellow-600 font-medium">~ {session.words_with_help} ayuda</span>
                  <span className="text-neutral-400">→ {session.words_skipped} saltadas</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
