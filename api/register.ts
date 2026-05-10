import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  password: z.string().min(6),
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, name, password } = schema.parse(req.body)

    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()

    if (existing) {
      return res.status(409).json({ error: 'Este email ya está registrado' })
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10')
    const password_hash = await bcrypt.hash(password, saltRounds)

    const { data: user, error } = await supabase
      .from('app_users')
      .insert({
        email: email.toLowerCase(),
        name,
        password_hash,
      })
      .select('id, email, name, created_at')
      .single()

    if (error) {
      return res.status(500).json({ error: 'Error al crear cuenta' })
    }

    return res.status(201).json({
      user,
      token: Buffer.from(`${user.id}:${Date.now()}`).toString('base64'),
    })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
