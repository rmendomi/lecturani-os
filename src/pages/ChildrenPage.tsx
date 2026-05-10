import { useNavigate } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ChildProfileCard } from '@/components/ChildProfileCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useChildren } from '@/hooks/useChildren'

export function ChildrenPage() {
  const navigate = useNavigate()
  const { children, isLoading } = useChildren()

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-card">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h1 className="text-xl font-black text-neutral-800">Perfiles de niños</h1>
        </div>

        {isLoading ? (
          <LoadingState />
        ) : (
          <div className="space-y-3">
            {children.map(child => (
              <ChildProfileCard key={child.id} child={child} />
            ))}
            {children.length === 0 && (
              <EmptyState
                icon="👦"
                title="Sin perfiles"
                description="Crea el primer perfil para comenzar a leer juntos"
              />
            )}
            <button
              onClick={() => navigate('/ninos/nuevo')}
              className="w-full py-4 rounded-2xl border-2 border-dashed border-neutral-200 text-neutral-500 font-semibold text-sm flex items-center justify-center gap-2 hover:border-primary/50 hover:text-primary transition-all"
            >
              <Plus className="w-5 h-5" />
              Agregar niño
            </button>
          </div>
        )}
      </div>
    </AppShell>
  )
}
