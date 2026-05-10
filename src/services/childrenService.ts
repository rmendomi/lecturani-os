import { supabase } from '@/lib/supabase'
import type { ChildProfile, ReadingLevel, ReadingObjective } from '@/types/database'

export interface CreateChildInput {
  name: string
  age: number
  reading_level: ReadingLevel
  interests: string[]
  objective?: ReadingObjective
}

export async function getChildren(userId: string): Promise<ChildProfile[]> {
  const { data, error } = await supabase
    .from('children_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ChildProfile[]
}

export async function getChild(childId: string): Promise<ChildProfile | null> {
  const { data, error } = await supabase
    .from('children_profiles')
    .select('*')
    .eq('id', childId)
    .single()
  if (error) return null
  return data as ChildProfile
}

export async function createChild(userId: string, input: CreateChildInput): Promise<ChildProfile> {
  const { data, error } = await supabase
    .from('children_profiles')
    .insert({
      user_id: userId,
      name: input.name,
      age: input.age,
      reading_level: input.reading_level,
      interests: input.interests,
      objective: input.objective ?? null,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ChildProfile
}

export async function updateChild(childId: string, updates: Partial<CreateChildInput>): Promise<ChildProfile> {
  const { data, error } = await supabase
    .from('children_profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', childId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ChildProfile
}

export async function deleteChild(childId: string): Promise<void> {
  const { error } = await supabase
    .from('children_profiles')
    .delete()
    .eq('id', childId)
  if (error) throw new Error(error.message)
}
