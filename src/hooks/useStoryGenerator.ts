import { useState, useCallback } from 'react'
import type { StoryWithBlocks, StoryAIResponse } from '@/types/database'
import { generateStory, type GenerateStoryInput } from '@/services/aiService'
import { saveStory } from '@/services/storiesService'
import { useAuth } from '@/contexts/AuthContext'

export function useStoryGenerator() {
  const { user } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (
    input: GenerateStoryInput,
    childId: string
  ): Promise<StoryWithBlocks | null> => {
    if (!user) return null
    setIsGenerating(true)
    setError(null)
    try {
      const aiResponse: StoryAIResponse = await generateStory(input)
      const story = await saveStory(user.id, childId, aiResponse, {
        theme: input.theme,
        estimated_minutes: input.durationMinutes,
      })
      return story
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al generar el cuento'
      setError(msg)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [user])

  return { generate, isGenerating, error }
}
