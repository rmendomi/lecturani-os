import { supabase } from '@/lib/supabase'
import type { ReadingSession, WordAttempt, SessionSummary } from '@/types/database'

export async function createSession(
  userId: string,
  childId: string,
  storyId: string
): Promise<ReadingSession> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .insert({
      user_id: userId,
      child_id: childId,
      story_id: storyId,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ReadingSession
}

export async function updateSession(
  sessionId: string,
  updates: Partial<ReadingSession>
): Promise<ReadingSession> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ReadingSession
}

export async function completeSession(
  sessionId: string,
  stats: {
    durationSeconds: number
    wordsAttempted: number
    wordsReadOk: number
    wordsWithHelp: number
    wordsSkipped: number
    summary: SessionSummary
  }
): Promise<ReadingSession> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .update({
      completed_at: new Date().toISOString(),
      duration_seconds: stats.durationSeconds,
      words_attempted: stats.wordsAttempted,
      words_read_ok: stats.wordsReadOk,
      words_with_help: stats.wordsWithHelp,
      words_skipped: stats.wordsSkipped,
      summary: stats.summary,
    })
    .eq('id', sessionId)
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as ReadingSession
}

export async function recordWordAttempt(
  sessionId: string,
  word: string,
  status: 'ok' | 'help' | 'skipped',
  hintUsed = false
): Promise<WordAttempt> {
  const { data, error } = await supabase
    .from('word_attempts')
    .insert({ session_id: sessionId, word, status, hint_used: hintUsed })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return data as WordAttempt
}

export async function getSessionsByChild(childId: string): Promise<ReadingSession[]> {
  const { data, error } = await supabase
    .from('reading_sessions')
    .select('*')
    .eq('child_id', childId)
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as ReadingSession[]
}

export async function getWeeklyStats(userId: string): Promise<{
  sessionsCount: number
  totalMinutes: number
  childrenRead: number
}> {
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('reading_sessions')
    .select('duration_seconds, child_id')
    .eq('user_id', userId)
    .not('completed_at', 'is', null)
    .gte('completed_at', weekAgo.toISOString())

  if (error) return { sessionsCount: 0, totalMinutes: 0, childrenRead: 0 }

  const sessions = data ?? []
  const totalSeconds = sessions.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0)
  const uniqueChildren = new Set(sessions.map((s: { child_id: string }) => s.child_id)).size

  return {
    sessionsCount: sessions.length,
    totalMinutes: Math.round(totalSeconds / 60),
    childrenRead: uniqueChildren,
  }
}
