export interface GenerateStoryInput {
  childName: string
  age: number
  readingLevel: string
  interests: string[]
  durationMinutes: number
  objective: string
  theme?: string
}

export async function generateStory(input: GenerateStoryInput) {
  const res = await fetch('/api/generate-story', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || 'Error al generar el cuento')
  }
  return res.json()
}

export async function getReadingFeedback(sessionData: {
  wordsAttempted: number
  wordsReadOk: number
  wordsWithHelp: number
  wordsSkipped: number
  childAge: number
  readingLevel: string
}) {
  const res = await fetch('/api/reading-feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sessionData),
  })
  if (!res.ok) {
    return {
      recommendation: 'Sigan practicando juntos, cada lectura cuenta.',
      encouragement: 'Lo más importante es que compartieron un momento especial.',
    }
  }
  return res.json()
}
