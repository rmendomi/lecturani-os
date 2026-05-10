import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { useNavigate } from 'react-router-dom'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registerSchema = loginSchema.extend({
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

type LoginForm = z.infer<typeof loginSchema>
type RegisterForm = z.infer<typeof registerSchema>

export function LoginPage() {
  const { login, register } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loginForm = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  const handleLogin = async (data: LoginForm) => {
    setIsSubmitting(true)
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al iniciar sesión', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (data: RegisterForm) => {
    setIsSubmitting(true)
    try {
      await register(data.email, data.name, data.password)
      navigate('/')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al registrarse', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm flex flex-col items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto shadow-button">
            <BookOpen className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-primary">Cuento Contigo</h1>
          <p className="text-neutral-500 text-sm leading-relaxed">
            Lecturas compartidas que acercan a padres e hijos
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-card p-6 space-y-5">
          <div className="flex rounded-2xl bg-neutral-100 p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'login' ? 'bg-white shadow-sm text-primary' : 'text-neutral-500'}`}
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${mode === 'register' ? 'bg-white shadow-sm text-primary' : 'text-neutral-500'}`}
            >
              Registrarse
            </button>
          </div>

          {mode === 'login' ? (
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700">Email</label>
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                  autoComplete="email"
                />
                {loginForm.formState.errors.email && (
                  <p className="text-xs text-danger">{loginForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700">Contraseña</label>
                <div className="relative">
                  <input
                    {...loginForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm pr-12"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-xs text-danger">{loginForm.formState.errors.password.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-button disabled:opacity-60 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700">Tu nombre</label>
                <input
                  {...registerForm.register('name')}
                  type="text"
                  placeholder="María o Juan"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                />
                {registerForm.formState.errors.name && (
                  <p className="text-xs text-danger">{registerForm.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700">Email</label>
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="tu@email.com"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-xs text-danger">{registerForm.formState.errors.email.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700">Contraseña</label>
                <div className="relative">
                  <input
                    {...registerForm.register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm pr-12"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {registerForm.formState.errors.password && (
                  <p className="text-xs text-danger">{registerForm.formState.errors.password.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-neutral-700">Confirmar contraseña</label>
                <input
                  {...registerForm.register('confirmPassword')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
                  autoComplete="new-password"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-xs text-danger">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-button disabled:opacity-60 active:scale-95 transition-all"
              >
                {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-xs text-neutral-400">
          Al usar Cuento Contigo, aceptas nuestros términos de uso
        </p>
      </div>
    </div>
  )
}
