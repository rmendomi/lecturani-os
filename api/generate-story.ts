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
2. Cada bloque es un párrafo narrativo rico que el adulto lee completo, con 3 a 5 oraciones (entre 50 y 90 palabras). Describe el ambiente, los personajes, sus emociones y acciones con detalle y viveza para que el niño pueda imaginar la escena.
3. En cada bloque marca entre 2 y 5 palabras CONSECUTIVAS como childWords — deben ser una frase CON CONTENIDO que el niño pueda visualizar e imaginar (ejemplos buenos: "dinosaurio azul", "olas gigantes", "saltó muy alto", "brillaba con fuerza", "pequeño robot valiente"). El niño las lee todas juntas de corrido. Estas palabras DEBEN aparecer juntas y EXACTAMENTE igual en el campo text del mismo bloque.
4. PROHIBIDO usar como childWords: artículos solos (el, la, los, las, un, una), preposiciones (de, en, a, por, con, para), conjunciones (y, o, pero, que), ni combinaciones que sean SOLO conectores sin sustantivo/verbo/adjetivo. Cada frase del niño DEBE contener al menos un sustantivo, adjetivo o verbo con significado concreto. Elige palabras apropiadas al nivel (${data.readingLevel}).
5. No todos los bloques necesitan childWords — algunos pueden tener childWords vacío.
6. syllableSupport: un string por cada childWord con las sílabas separadas por guion (ejemplo: "lu-na", "ca-sa", "ro-bot").
7. hint: pista corta y amable para si el niño necesita ayuda con la frase.
8. El cuento debe tener entre 5 y 7 bloques. Cada bloque es una "página" del cuento con una escena completa y evocadora.
9. El cuento debe ser cálido, entretenido, lleno de imágenes mentales y apropiado para la edad.
10. Incluye EXACTAMENTE 3 preguntas de comprensión al final.
11. DEVUELVE SOLO JSON VÁLIDO, sin markdown, sin texto adicional.

ESTRUCTURA JSON — EJEMPLO (con bloques largos y descriptivos):
{
  "title": "El robot de la montaña",
  "objective": "Practicar lectura de palabras simples dentro de texto continuo",
  "estimatedMinutes": ${data.durationMinutes},
  "blocks": [
    {
      "reader": "adult",
      "text": "En lo más alto de una montaña cubierta de nieve y nubes blancas, vivía un pequeño robot llamado Tito. Sus ojos brillaban como lunas y sus pies eran de madera crujiente. Cada mañana se asomaba a la ventana de su casita de metal y miraba el mundo de allá abajo, tan verde y tan vivo, con una sonrisa llena de curiosidad.",
      "childWords": ["pequeño", "robot"],
      "syllableSupport": ["pe-que-ño", "ro-bot"],
      "hint": "¿Cómo se llama el personaje? ¡Léelo juntos!"
    },
    {
      "reader": "adult",
      "text": "Una tarde nublada, Tito escuchó un sonido extraño entre los árboles del bosque. Era un lloriqueo suave, como el viento que susurra secretos. Con pasos cuidadosos bajó por el sendero de piedras y encontró a una niña sentada junto a un árbol enorme, con las rodillas abrazadas y los ojos muy tristes.",
      "childWords": ["árbol", "enorme"],
      "syllableSupport": ["ár-bol", "e-nor-me"],
      "hint": "¿Qué tan grande era el árbol?"
    },
    {
      "reader": "adult",
      "text": "La niña se llamaba Sofía y se había perdido buscando flores para su abuela. Tito la miró con ternura y le ofreció su mano de metal, que brillaba como un espejo bajo la luz de la tarde. Juntos comenzaron a caminar por el bosque, cantando una canción que Tito había inventado para espantar el miedo.",
      "childWords": ["flores", "coloridas"],
      "syllableSupport": ["flo-res", "co-lo-ri-das"],
      "hint": "¿Qué buscaba la niña?"
    }
  ],
  "questions": [
    { "question": "¿Dónde vivía el robot Tito?", "answer": "En lo alto de una montaña" },
    { "question": "¿Por qué estaba perdida la niña?", "answer": "Buscaba flores para su abuela" },
    { "question": "¿Qué hicieron juntos por el bosque?", "answer": "Caminaron cantando una canción" }
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
      max_tokens: 8192,
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
