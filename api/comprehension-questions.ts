import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'

const schema = z.object({
  storyTitle: z.string(),
  questions: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  })),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const data = schema.parse(req.body)
    return res.status(200).json({ questions: data.questions })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }
    return res.status(500).json({ error: 'Error interno' })
  }
}
