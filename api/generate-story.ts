import type { VercelRequest, VercelResponse } from '@vercel/node'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const schema = z.object({
  childName: z.string().min(1),
  age: z.number().min(2).max(12),
  readingLevel: z.enum(['prelector', 'inicial', 'en_desarrollo', 'avanzado']),
  interests: z.array(z.string()),
  durationMinutes: z.number().min(1).max(30),
  objective: z.string(),
  theme: z.string().optional(),
})

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

const READING_LEVEL_DESCRIPTIONS: Record<string, string> = {
  prelector: 'El niño reconoce letras pero no lee palabras. Participará solo reconociendo letras iniciales o sílabas muy simples.',
  inicial: 'El niño lee sílabas simples y algunas palabras de 2-3 letras. Usará palabras como: ma, pa, sol, luz, ola.',
  en_desarrollo: 'El niño lee palabras completas de hasta 6 letras. Puede leer palabras como: luna, casa, gato, flor.',
  avanzado: 'El niño lee frases cortas con fluidez. Puede leer expresiones de 2-4 palabras.',
}

function buildPrompt(data: z.infer<typeof schema>): string {
  const levelDesc = READING_LEVEL_DESCRIPTIONS[data.readingLevel]
  const themeText = data.theme ? `- Tipo de cuento: ${data.theme}` : ''

  return `Actúa como especialista en lectoescritura inicial, educación infantil y lectura compartida familiar.

Debes crear un cuento breve para que un adulto y un niño lean juntos.

Datos del niño:
- Nombre: ${data.childName}
- Edad: ${data.age} años
- Nivel lector: ${data.readingLevel}
- Descripción del nivel: ${levelDesc}
- Intereses: ${data.interests.join(', ')}
- Duración estimada: ${data.durationMinutes} minutos
- Objetivo lector: ${data.objective}
${themeText}

REGLAS OBLIGATORIAS:
1. El adulto lee la MAYOR PARTE del cuento (mínimo 70% del texto).
2. El niño participa leyendo SOLO palabras o frases adecuadas a su nivel lector.
3. No sobreexijas al niño. Prefiere palabras más simples que más complejas.
4. El cuento debe ser cálido, entretenido y apropiado para la edad.
5. Cada bloque de tipo "child" debe tener EXACTAMENTE 1-3 palabras objetivo.
6. Para nivel "prelector": solo sílabas simples (ma, pa, so, lu).
7. Para nivel "inicial": palabras de 2-3 letras (sol, mar, luz, pie, pan).
8. Para nivel "en_desarrollo": palabras simples de hasta 6 letras (luna, casa, perro, flor).
9. Para nivel "avanzado": frases cortas de 2-4 palabras.
10. Cada palabra del niño DEBE tener: syllableSupport (array de sílabas separadas) y hint (pista amable).
11. Incluye EXACTAMENTE 3 preguntas de comprensión al final.
12. El cuento debe tener entre 8 y 15 bloques en total.
13. Alterna entre bloques de adulto y bloques del niño. No pongas 2 bloques del niño seguidos.
14. DEVUELVE SOLO JSON VÁLIDO, sin markdown, sin texto adicional.

ESTRUCTURA OBLIGATORIA DEL JSON:
{
  "title": "Título del cuento",
  "objective": "Descripción del objetivo lector",
  "estimatedMinutes": ${data.durationMinutes},
  "blocks": [
    {
      "reader": "adult",
      "text": "El adulto lee este texto en voz alta para el niño.",
      "childWords": [],
      "syllableSupport": [],
      "hint": ""
    },
    {
      "reader": "child",
      "text": "luna",
      "childWords": ["luna"],
      "syllableSupport": ["lu", "na"],
      "hint": "Empieza con lu... ¿puedes seguir?"
    }
  ],
  "questions": [
    {
      "question": "¿Qué vio el niño en el cuento?",
      "answer": "La luna"
    }
  ],
  "recommendation": "Consejo breve para continuar practicando en casa."
}`
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const input = schema.parse(req.body)
    const prompt = buildPrompt(input)

    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return res.status(500).json({ error: 'Respuesta inesperada de la IA' })
    }

    let storyData
    try {
      const jsonText = content.text.trim()
      storyData = JSON.parse(jsonText)
    } catch {
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return res.status(500).json({ error: 'No se pudo parsear la respuesta' })
      }
      storyData = JSON.parse(jsonMatch[0])
    }

    return res.status(200).json(storyData)
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos', details: e.errors })
    }
    console.error('Error generating story:', e)
    return res.status(500).json({ error: 'Error al generar el cuento' })
  }
}
