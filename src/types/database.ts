export interface AppUser {
  id: string
  email: string
  name: string | null
  password_hash: string
  created_at: string
}

export interface ChildProfile {
  id: string
  user_id: string
  name: string
  age: number
  reading_level: ReadingLevel
  interests: string[]
  objective: string | null
  created_at: string
  updated_at: string
}

export interface Story {
  id: string
  user_id: string
  child_id: string
  title: string
  theme: string | null
  age: number | null
  reading_level: string | null
  objective: string | null
  estimated_minutes: number | null
  raw_ai_response: StoryAIResponse | null
  created_at: string
}

export interface StoryBlock {
  id: string
  story_id: string
  order_index: number
  text: string
  reader: 'adult' | 'child' | 'shared'
  child_words: string[] | null
  syllable_support: Record<string, string[]> | null
  hint: string | null
  created_at: string
}

export interface ReadingSession {
  id: string
  user_id: string
  child_id: string
  story_id: string
  started_at: string
  completed_at: string | null
  duration_seconds: number | null
  words_attempted: number
  words_read_ok: number
  words_with_help: number
  words_skipped: number
  summary: SessionSummary | null
}

export interface WordAttempt {
  id: string
  session_id: string
  word: string
  status: 'ok' | 'help' | 'skipped'
  hint_used: boolean
  created_at: string
}

export type ReadingLevel = 'prelector' | 'inicial' | 'en_desarrollo' | 'avanzado'

export type ReadingObjective =
  | 'reconocer_letras'
  | 'leer_silabas'
  | 'leer_palabras'
  | 'leer_frases'
  | 'mejorar_comprension'
  | 'mejorar_fluidez'

export type StoryTheme =
  | 'antes_de_dormir'
  | 'aventura'
  | 'animales'
  | 'colegio'
  | 'emociones'
  | 'fantasia'
  | 'personalizado'

export interface StoryAIResponse {
  title: string
  objective: string
  estimatedMinutes: number
  blocks: AIBlock[]
  questions: ComprehensionQuestion[]
  recommendation: string
}

export interface AIBlock {
  reader: 'adult' | 'child' | 'shared'
  text: string
  childWords?: string[]
  syllableSupport?: string[]
  hint?: string
}

export interface ComprehensionQuestion {
  question: string
  answer: string
}

export interface SessionSummary {
  wordsAttempted: number
  wordsReadOk: number
  wordsWithHelp: number
  wordsSkipped: number
  durationSeconds: number
  recommendation: string
  encouragement: string
}

export interface StoryWithBlocks extends Story {
  blocks: StoryBlock[]
  questions?: ComprehensionQuestion[]
  recommendation?: string
}
