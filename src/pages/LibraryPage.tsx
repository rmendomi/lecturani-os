import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { StoryCard } from '@/components/StoryCard'
import { LoadingState } from '@/components/LoadingState'
import { EmptyState } from '@/components/EmptyState'
import { useStories } from '@/hooks/useStories'
import { useChildren } from '@/hooks/useChildren'
import { useToast } from '@/contexts/ToastContext'

export function LibraryPage() {
  const navigate = useNavigate()
  const { stories, isLoading, removeStory } = useStories()
  const { children } = useChildren()
  const { showToast } = useToast()
  const [search, setSearch] = useState('')

  const filtered = stories.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  )

  const getChildName = (childId: string) =>
    children.find(c => c.id === childId)?.name

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar "${title}"?`)) return
    try {
      await removeStory(id)
      showToast('Cuento eliminado', 'info')
    } catch {
      showToast('No se pudo eliminar', 'error')
    }
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-5">
        <h1 className="text-2xl font-black text-neutral-800">Biblioteca</h1>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar cuento..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm bg-white"
          />
        </div>

        {isLoading ? (
          <LoadingState />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📚"
            title={search ? 'Sin resultados' : 'Biblioteca vacía'}
            description={search ? 'Intenta con otro término' : 'Crea tu primer cuento personalizado'}
            action={!search ? (
              <button
                onClick={() => navigate('/crear')}
                className="px-6 py-3 rounded-2xl bg-primary text-white font-semibold text-sm"
              >
                Crear cuento
              </button>
            ) : undefined}
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(story => (
              <div key={story.id} className="relative group">
                <StoryCard
                  story={story}
                  childName={getChildName(story.child_id)}
                />
                <button
                  onClick={() => handleDelete(story.id, story.title)}
                  className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-danger opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
