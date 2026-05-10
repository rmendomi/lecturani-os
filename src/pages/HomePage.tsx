import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen, Sparkles } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/AppShell'
import { ChildProfileCard } from '@/components/ChildProfileCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useChildren } from '@/hooks/useChildren'
import { getWeeklyStats } from '@/services/readingSessionsService'
import { pluralize } from '@/utils/formatters'

export function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { children, isLoading } = useChildren()
  const [weeklyStats, setWeeklyStats] = useState({ sessionsCount: 0, totalMinutes: 0, childrenRead: 0 })

  useEffect(() => {
    if (user) {
      getWeeklyStats(user.id).then(setWeeklyStats)
    }
  }, [user])

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días'
    if (hour < 19) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const firstName = user?.name?.split(' ')[0] ?? 'amigo'

  return (
    <AppShell>
      <div className="px-5 pt-8 pb-4 space-y-6">
        <div className="space-y-1">
          <p className="text-neutral-500 text-sm">{greeting()},</p>
          <h1 className="text-2xl font-black text-neutral-800">{firstName} 👋</h1>
        </div>

        {weeklyStats.sessionsCount > 0 && (
          <div className="bg-primary rounded-3xl p-5 text-white space-y-1 shadow-button">
            <p className="text-sm font-medium opacity-80">Esta semana leyeron juntos</p>
            <p className="text-3xl font-black">
              {pluralize(weeklyStats.sessionsCount, 'vez', 'veces')}
            </p>
            <p className="text-sm opacity-70">
              {weeklyStats.totalMinutes} minutos de lectura compartida
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate('/crear')}
            className="w-full bg-primary text-white rounded-3xl p-5 flex items-center gap-4 shadow-button active:scale-98 transition-all"
          >
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg">Crear cuento</p>
              <p className="text-sm opacity-80">La IA genera uno personalizado</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/biblioteca')}
            className="w-full bg-white rounded-3xl p-5 flex items-center gap-4 shadow-card border border-neutral-100 active:scale-98 transition-all"
          >
            <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div className="text-left">
              <p className="font-black text-lg text-neutral-800">Mis cuentos</p>
              <p className="text-sm text-neutral-400">Ver biblioteca guardada</p>
            </div>
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-neutral-700 text-base">Niños</h2>
            <button
              onClick={() => navigate('/ninos/nuevo')}
              className="flex items-center gap-1 text-primary text-sm font-semibold"
            >
              <Plus className="w-4 h-4" />
              Agregar
            </button>
          </div>

          {isLoading ? (
            <LoadingState message="Cargando perfiles..." size="sm" />
          ) : children.length === 0 ? (
            <EmptyState
              icon="👦"
              title="Sin perfiles aún"
              description="Agrega el perfil de un niño para comenzar"
              action={
                <button
                  onClick={() => navigate('/ninos/nuevo')}
                  className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm"
                >
                  Agregar niño
                </button>
              }
            />
          ) : (
            <div className="space-y-3">
              {children.map(child => (
                <ChildProfileCard
                  key={child.id}
                  child={child}
                  onSelect={(c) => navigate(`/crear?childId=${c.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
