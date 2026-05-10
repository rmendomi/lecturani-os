import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, currentPassword, newPassword } = schema.parse(req.body)

    const { data: user, error } = await supabase
      .from('app_users')
      .select('id, password_hash')
      .eq('email', email.toLowerCase())
      .single()

    if (error || !user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    const valid = await bcrypt.compare(currentPassword, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' })
    }

    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '10')
    const newHash = await bcrypt.hash(newPassword, saltRounds)

    const { error: updateError } = await supabase
      .from('app_users')
      .update({ password_hash: newHash })
      .eq('id', user.id)

    if (updateError) {
      return res.status(500).json({ error: 'Error al actualizar contraseña' })
    }

    return res.status(200).json({ success: true })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json({ error: 'Datos inválidos' })
    }
    return res.status(500).json({ error: 'Error interno del servidor' })
  }
}
