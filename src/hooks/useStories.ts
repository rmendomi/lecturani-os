import { useState, useEffect, useCallback } from 'react'
import type { Story } from '@/types/database'
import { getStories, deleteStory } from '@/services/storiesService'
import { useAuth } from '@/contexts/AuthContext'

export function useStories() {
  const { user } = useAuth()
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await getStories(user.id)
      setStories(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar cuentos')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const removeStory = useCallback(async (id: string) => {
    await deleteStory(id)
    setStories(prev => prev.filter(s => s.id !== id))
  }, [])

  return { stories, isLoading, error, reload: load, removeStory }
}
