import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Lock, ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AppShell } from '@/components/AppShell'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Requerido'),
  newPassword: z.string().min(6, 'Mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type PasswordForm = z.infer<typeof passwordSchema>

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleChangePassword = async (data: PasswordForm) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user?.email,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      })
      if (!res.ok) throw new Error('Error al cambiar contraseña')
      showToast('Contraseña actualizada', 'success')
      setShowPasswordForm(false)
      reset()
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-4 space-y-5">
        <h1 className="text-2xl font-black text-neutral-800">Ajustes</h1>

        <div className="bg-white rounded-3xl shadow-card p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
            <User className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p className="font-bold text-neutral-800">{user?.name ?? 'Usuario'}</p>
            <p className="text-sm text-neutral-400">{user?.email}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-card overflow-hidden">
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-neutral-50 transition-colors"
          >
            <Lock className="w-5 h-5 text-neutral-500" />
            <span className="flex-1 text-left text-sm font-semibold text-neutral-700">Cambiar contraseña</span>
            <ChevronRight className={`w-4 h-4 text-neutral-300 transition-transform ${showPasswordForm ? 'rotate-90' : ''}`} />
          </button>

          {showPasswordForm && (
            <form onSubmit={handleSubmit(handleChangePassword)} className="px-5 pb-5 space-y-3 border-t border-neutral-100">
              <div className="pt-4 space-y-3">
                <input
                  {...register('currentPassword')}
                  type="password"
                  placeholder="Contraseña actual"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                />
                {errors.currentPassword && <p className="text-xs text-danger">{errors.currentPassword.message}</p>}
                <input
                  {...register('newPassword')}
                  type="password"
                  placeholder="Nueva contraseña"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                />
                {errors.newPassword && <p className="text-xs text-danger">{errors.newPassword.message}</p>}
                <input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="Confirmar nueva contraseña"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                />
                {errors.confirmPassword && <p className="text-xs text-danger">{errors.confirmPassword.message}</p>}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-2xl bg-primary text-white font-bold text-sm disabled:opacity-60"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          )}
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-3xl shadow-card hover:bg-red-50 transition-colors group"
        >
          <LogOut className="w-5 h-5 text-danger" />
          <span className="text-sm font-semibold text-danger">Cerrar sesión</span>
        </button>

        <p className="text-center text-xs text-neutral-300">Cuento Contigo v1.0</p>
      </div>
    </AppShell>
  )
}
