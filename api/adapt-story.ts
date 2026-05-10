import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const schema = z.object({
  storyId: z.string(),
  targetLevel: z.enum(['prelector', 'inicial', 'en_desarrollo', 'avanzado']),
  currentBlocks: z.array(z.object({
    reader: z.enum(['adult', 'child', 'shared']),
    text: z.string(),
  })),
})

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { targetLevel, currentBlocks } = schema.parse(req.body)

    const storyText = currentBlocks.map(b => b.text).join(' ')

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Adapta este cuento al nivel "${targetLevel}" sin cambiar la historia principal. Identifica qué palabras son apropiadas para que las lea el niño según el nivel. Devuelve SOLO JSON válido:
{
  "blocks": [
    {"reader": "adult"|"child"|"shared", "text": "...", "childWords": [], "syllableSupport": [], "hint": ""}
  ]
}

Cuento: ${storyText}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    const match = content.text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('No JSON found')

    return res.status(200).json(JSON.parse(match[0]))
  } catch (e) {
    return res.status(500).json({ error: 'Error al adaptar el cuento' })
  }
}
