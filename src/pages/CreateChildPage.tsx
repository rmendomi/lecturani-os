import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { DifficultySelector } from '@/components/DifficultySelector'
import { InterestSelector } from '@/components/InterestSelector'
import { useChildren } from '@/hooks/useChildren'
import { useToast } from '@/contexts/ToastContext'
import { READING_OBJECTIVES } from '@/utils/readingLevels'
import type { ReadingLevel, ReadingObjective } from '@/types/database'

const schema = z.object({
  name: z.string().min(2, 'El nombre es requerido'),
  age: z.number().min(2).max(12),
  reading_level: z.enum(['prelector', 'inicial', 'en_desarrollo', 'avanzado']),
  interests: z.array(z.string()).min(1, 'Elige al menos un interés'),
  objective: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateChildPage() {
  const navigate = useNavigate()
  const { addChild } = useChildren()
  const { showToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      age: 6,
      interests: [],
    },
  })

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    try {
      await addChild({
        name: data.name,
        age: data.age,
        reading_level: data.reading_level as ReadingLevel,
        interests: data.interests,
        objective: data.objective as ReadingObjective | undefined,
      })
      showToast(`Perfil de ${data.name} creado`, 'success')
      navigate('/ninos')
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Error al crear perfil', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const objectives = Object.entries(READING_OBJECTIVES) as [ReadingObjective, string][]

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-card">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h1 className="text-xl font-black text-neutral-800">Nuevo perfil</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-bold text-neutral-700">Nombre del niño</label>
            <input
              {...register('name')}
              placeholder="¿Cómo se llama?"
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
            />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-neutral-700">Edad</label>
            <input
              {...register('age', { valueAsNumber: true })}
              type="number"
              min={2}
              max={12}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm"
            />
            {errors.age && <p className="text-xs text-danger">{errors.age.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Nivel lector</label>
            <Controller
              control={control}
              name="reading_level"
              render={({ field }) => (
                <DifficultySelector
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  error={errors.reading_level?.message}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Intereses</label>
            <Controller
              control={control}
              name="interests"
              render={({ field }) => (
                <InterestSelector
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.interests?.message}
                />
              )}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Objetivo principal (opcional)</label>
            <div className="grid grid-cols-2 gap-2">
              {objectives.map(([key, label]) => (
                <label key={key} className="flex items-center gap-2 p-3 rounded-2xl border border-neutral-200 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input {...register('objective')} type="radio" value={key} className="accent-primary" />
                  <span className="text-sm text-neutral-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base shadow-button disabled:opacity-60 active:scale-95 transition-all"
          >
            {isSubmitting ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </AppShell>
  )
}
