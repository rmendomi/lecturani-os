import { supabase } from '@/lib/supabase'
import type { Story, StoryBlock, StoryWithBlocks, StoryAIResponse } from '@/types/database'

export async function getStories(userId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Story[]
}

export async function getStoriesByChild(childId: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select('*')
    .eq('child_id', childId)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Story[]
}

export async function getStoryWithBlocks(storyId: string): Promise<StoryWithBlocks | null> {
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*')
    .eq('id', storyId)
    .single()
  if (storyError || !story) return null

  const { data: blocks, error: blocksError } = await supabase
    .from('story_blocks')
    .select('*')
    .eq('story_id', storyId)
    .order('order_index', { ascending: true })
  if (blocksError) throw new Error(blocksError.message)

  const storyData = story as Story
  const aiResponse = storyData.raw_ai_response as StoryAIResponse | null

  return {
    ...storyData,
    blocks: (blocks ?? []) as StoryBlock[],
    questions: aiResponse?.questions,
    recommendation: aiResponse?.recommendation,
  }
}

export async function saveStory(
  userId: string,
  childId: string,
  aiResponse: StoryAIResponse,
  config: { theme?: string; estimated_minutes?: number }
): Promise<StoryWithBlocks> {
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      user_id: userId,
      child_id: childId,
      title: aiResponse.title,
      theme: config.theme ?? null,
      objective: aiResponse.objective,
      estimated_minutes: aiResponse.estimatedMinutes,
      raw_ai_response: aiResponse,
    })
    .select()
    .single()
  if (storyError) throw new Error(storyError.message)

  const blocksToInsert = aiResponse.blocks.map((block, idx) => ({
    story_id: (story as Story).id,
    order_index: idx,
    text: block.text,
    reader: block.reader,
    child_words: block.childWords ?? null,
    syllable_support: block.syllableSupport
      ? Object.fromEntries(
          (block.childWords ?? []).map((word, i) => [word, block.syllableSupport?.[i] ? [block.syllableSupport[i]] : []])
        )
      : null,
    hint: block.hint ?? null,
  }))

  const { data: blocks, error: blocksError } = await supabase
    .from('story_blocks')
    .insert(blocksToInsert)
    .select()
  if (blocksError) throw new Error(blocksError.message)

  return {
    ...(story as Story),
    blocks: (blocks ?? []) as StoryBlock[],
    questions: aiResponse.questions,
    recommendation: aiResponse.recommendation,
  }
}

export async function deleteStory(storyId: string): Promise<void> {
  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', storyId)
  if (error) throw new Error(error.message)
}
