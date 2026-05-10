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
  prelector: 'El niño reconoce letras. Las palabras marcadas deben ser sílabas simples de 2 letras (ma, pa, sol, luz) que el niño pueda decir junto al adulto.',
  inicial: 'El niño lee palabras simples. Las palabras marcadas deben ser de 2-4 letras: sol, mar, luz, pan, pez, oso.',
  en_desarrollo: 'El niño lee palabras completas. Las palabras marcadas pueden tener hasta 6 letras: luna, casa, gato, flor, árbol.',
  avanzado: 'El niño lee con fluidez. Las palabras marcadas pueden ser más largas o expresivas: montaña, valiente, brillaba.',
}

function buildPrompt(data: z.infer<typeof schema>): string {
  const levelDesc = READING_LEVEL_DESCRIPTIONS[data.readingLevel]
  const themeText = data.theme ? `- Tipo de cuento: ${data.theme}` : ''

  return `Actúa como especialista en lectura compartida familiar y lectoescritura inicial.

Crea un cuento corto para que un adulto y un niño lean JUNTOS, en voz alta y de forma continua.

Datos del niño:
- Nombre: ${data.childName}
- Edad: ${data.age} años
- Nivel lector: ${data.readingLevel} — ${levelDesc}
- Intereses: ${data.interests.join(', ')}
- Duración estimada: ${data.durationMinutes} minutos
- Objetivo: ${data.objective}
${themeText}

MODELO DE LECTURA CONJUNTA:
El adulto lee TODO el texto sin parar. Algunas palabras dentro de cada párrafo están marcadas como "palabras del niño" (childWords). Cuando el adulto llega a esa palabra, AMBOS la dicen en voz alta juntos al mismo tiempo. La pantalla las muestra más grandes y resaltadas para que el niño sepa cuándo participar. Esto genera complicidad y atención sin cortar el flujo del cuento.

REGLAS OBLIGATORIAS:
1. USA SOLO reader:"adult". NUNCA uses reader:"child" ni reader:"shared".
2. Cada bloque es un párrafo o frase que el adulto lee completo.
3. En cada bloque puedes marcar 1 o 2 palabras como childWords. Estas palabras DEBEN aparecer EXACTAMENTE igual en el campo text del mismo bloque.
4. Elige childWords adecuadas al nivel del niño (${data.readingLevel}).
5. No todos los bloques necesitan childWords — algunos pueden tener childWords vacío.
6. syllableSupport: un string por cada childWord con las sílabas separadas por guion (ejemplo: "lu-na", "ca-sa", "ro-bot").
7. hint: pista corta y amable para si el niño necesita ayuda con esa palabra.
8. El cuento debe tener entre 6 y 10 bloques.
9. El cuento debe ser cálido, entretenido y apropiado para la edad.
10. Incluye EXACTAMENTE 3 preguntas de comprensión al final.
11. DEVUELVE SOLO JSON VÁLIDO, sin markdown, sin texto adicional.

ESTRUCTURA JSON — EJEMPLO:
{
  "title": "El robot de la montaña",
  "objective": "Practicar lectura de palabras simples dentro de texto continuo",
  "estimatedMinutes": ${data.durationMinutes},
  "blocks": [
    {
      "reader": "adult",
      "text": "En lo alto de la montaña vivía un pequeño robot.",
      "childWords": ["robot"],
      "syllableSupport": ["ro-bot"],
      "hint": "Empieza con ro... ¿puedes seguir?"
    },
    {
      "reader": "adult",
      "text": "Tenía ojos de luna y pies de madera.",
      "childWords": ["luna"],
      "syllableSupport": ["lu-na"],
      "hint": "Lu... na. ¡Dilo despacio!"
    },
    {
      "reader": "adult",
      "text": "Cada noche salía a mirar las estrellas del cielo.",
      "childWords": [],
      "syllableSupport": [],
      "hint": ""
    },
    {
      "reader": "adult",
      "text": "Un día encontró a una niña perdida en el bosque.",
      "childWords": ["niña"],
      "syllableSupport": ["ni-ña"],
      "hint": "Empieza con ni..."
    }
  ],
  "questions": [
    { "question": "¿Dónde vivía el robot?", "answer": "En lo alto de la montaña" },
    { "question": "¿Qué hacía el robot cada noche?", "answer": "Miraba las estrellas" },
    { "question": "¿A quién encontró en el bosque?", "answer": "A una niña perdida" }
  ],
  "recommendation": "Consejo breve para seguir practicando en casa."
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
