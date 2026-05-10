import type { ReadingLevel, ReadingObjective, StoryTheme } from '@/types/database'

export const READING_LEVELS: Record<ReadingLevel, { label: string; description: string; color: string }> = {
  prelector: {
    label: 'Prelector',
    description: 'Reconoce letras y algunas sílabas',
    color: 'bg-purple-100 text-purple-700',
  },
  inicial: {
    label: 'Inicial',
    description: 'Lee sílabas y palabras simples',
    color: 'bg-blue-100 text-blue-700',
  },
  en_desarrollo: {
    label: 'En desarrollo',
    description: 'Lee palabras y frases cortas',
    color: 'bg-green-100 text-green-700',
  },
  avanzado: {
    label: 'Avanzado',
    description: 'Lee frases y textos cortos',
    color: 'bg-emerald-100 text-emerald-700',
  },
}

export const READING_OBJECTIVES: Record<ReadingObjective, string> = {
  reconocer_letras: 'Reconocer letras',
  leer_silabas: 'Leer sílabas',
  leer_palabras: 'Leer palabras',
  leer_frases: 'Leer frases',
  mejorar_comprension: 'Mejorar comprensión',
  mejorar_fluidez: 'Mejorar fluidez',
}

export const STORY_THEMES: Record<StoryTheme, { label: string; emoji: string }> = {
  antes_de_dormir: { label: 'Antes de dormir', emoji: '🌙' },
  aventura: { label: 'Aventura', emoji: '🗺️' },
  animales: { label: 'Animales', emoji: '🦁' },
  colegio: { label: 'Colegio', emoji: '📚' },
  emociones: { label: 'Emociones', emoji: '💚' },
  fantasia: { label: 'Fantasía', emoji: '✨' },
  personalizado: { label: 'Personalizado', emoji: '⭐' },
}

export const COMMON_INTERESTS = [
  'animales', 'espacio', 'dinosaurios', 'princesas', 'superhéroes',
  'música', 'arte', 'deportes', 'naturaleza', 'robots', 'magia',
  'aventuras', 'amigos', 'familia', 'cocina', 'mar', 'montaña',
]

export function getLevelLabel(level: ReadingLevel): string {
  return READING_LEVELS[level]?.label ?? level
}

export function getObjectiveLabel(objective: string): string {
  return READING_OBJECTIVES[objective as ReadingObjective] ?? objective
}

export function getThemeLabel(theme: string): string {
  const t = STORY_THEMES[theme as StoryTheme]
  return t ? `${t.emoji} ${t.label}` : theme
}

export function getLevelObjectiveDescription(level: ReadingLevel): string {
  const descriptions: Record<ReadingLevel, string> = {
    prelector: 'El niño participará reconociendo letras iniciales',
    inicial: 'El niño leerá sílabas y palabras simples de 2-3 letras',
    en_desarrollo: 'El niño leerá palabras completas con apoyo silábico',
    avanzado: 'El niño leerá frases cortas y oraciones simples',
  }
  return descriptions[level]
}
