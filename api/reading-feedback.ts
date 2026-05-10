import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const schema = z.object({
  wordsAttempted: z.number(),
  wordsReadOk: z.number(),
  wordsWithHelp: z.number(),
  wordsSkipped: z.number(),
  childAge: z.number(),
  readingLevel: z.string(),
})

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const data = schema.parse(req.body)
    const successRate = data.wordsAttempted > 0
      ? Math.round((data.wordsReadOk / data.wordsAttempted) * 100)
      : 0

    if (data.wordsAttempted === 0) {
      return res.status(200).json({
        recommendation: 'Sigan leyendo juntos, cada sesión es un avance.',
        encouragement: 'Lo más importante es compartir este momento especial.',
      })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      messages: [
        {
          role: 'user',
          content: `Eres un especialista en lectura infantil. Un niño de ${data.childAge} años con nivel "${data.readingLevel}" completó una sesión de lectura compartida:
- Palabras intentadas: ${data.wordsAttempted}
- Sin ayuda: ${data.wordsReadOk} (${successRate}%)
- Con apoyo: ${data.wordsWithHelp}
- Saltadas: ${data.wordsSkipped}

Genera exactamente este JSON (sin markdown):
{
  "recommendation": "Consejo específico y alentador de 1-2 oraciones para practicar en casa",
  "encouragement": "Mensaje cálido de 1 oración para el adulto sobre el valor del momento compartido"
}`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') throw new Error('Invalid response')

    let feedback
    try {
      feedback = JSON.parse(content.text.trim())
    } catch {
      const match = content.text.match(/\{[\s\S]*\}/)
      feedback = match ? JSON.parse(match[0]) : {
        recommendation: 'Sigan practicando con palabras simples en situaciones cotidianas.',
        encouragement: 'Cada momento de lectura compartida fortalece el vínculo familiar.',
      }
    }

    return res.status(200).json(feedback)
  } catch (e) {
    return res.status(200).json({
      recommendation: 'Sigan practicando juntos con palabras simples del día a día.',
      encouragement: 'Lo más importante es que compartieron un momento especial hoy.',
    })
  }
}
