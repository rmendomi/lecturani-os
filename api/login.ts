import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, password } = schema.parse(req.body)

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, email, name, password_hash, created_at')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' })
    }

    const { password_hash: _, ...safeUser } = user

    return res.status(200).json({
      user: safeUser,
      token: Buffer.from(`${user.id}:${Date.now()}`).toString('base64'),
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
