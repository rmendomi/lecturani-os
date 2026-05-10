import { useState, useEffect, useCallback } from 'react'
import type { ChildProfile } from '@/types/database'
import { getChildren, createChild, updateChild, deleteChild } from '@/services/childrenService'
import type { CreateChildInput } from '@/services/childrenService'
import { useAuth } from '@/contexts/AuthContext'

export function useChildren() {
  const { user } = useAuth()
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    try {
      const data = await getChildren(user.id)
      setChildren(data)
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar perfiles')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => { load() }, [load])

  const addChild = useCallback(async (input: CreateChildInput) => {
    if (!user) throw new Error('No autenticado')
    const child = await createChild(user.id, input)
    setChildren(prev => [child, ...prev])
    return child
  }, [user])

  const editChild = useCallback(async (id: string, input: Partial<CreateChildInput>) => {
    const child = await updateChild(id, input)
    setChildren(prev => prev.map(c => c.id === id ? child : c))
    return child
  }, [])

  const removeChild = useCallback(async (id: string) => {
    await deleteChild(id)
    setChildren(prev => prev.filter(c => c.id !== id))
  }, [])

  return { children, isLoading, error, reload: load, addChild, editChild, removeChild }
}
