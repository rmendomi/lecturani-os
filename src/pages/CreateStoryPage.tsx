import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { LoadingState } from '@/components/LoadingState'
import { useStoryGenerator } from '@/hooks/useStoryGenerator'
import { useChildren } from '@/hooks/useChildren'
import { useToast } from '@/contexts/ToastContext'
import { STORY_THEMES, READING_OBJECTIVES, getLevelObjectiveDescription } from '@/utils/readingLevels'
import type { StoryTheme, ReadingObjective, ReadingLevel } from '@/types/database'

const schema = z.object({
  childId: z.string().min(1, 'Selecciona un niño'),
  theme: z.string().optional(),
  durationMinutes: z.number().min(3).max(20),
  objective: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function CreateStoryPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedChildId = searchParams.get('childId') ?? ''
  const { children, isLoading: loadingChildren } = useChildren()
  const { generate, isGenerating } = useStoryGenerator()
  const { showToast } = useToast()

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      childId: preselectedChildId,
      durationMinutes: 5,
    },
  })

  const selectedChildId = watch('childId')
  const selectedChild = children.find(c => c.id === selectedChildId)
  const themes = Object.entries(STORY_THEMES) as [StoryTheme, { label: string; emoji: string }][]
  const objectives = Object.entries(READING_OBJECTIVES) as [ReadingObjective, string][]

  const onSubmit = async (data: FormData) => {
    if (!selectedChild) return
    const story = await generate(
      {
        childName: selectedChild.name,
        age: selectedChild.age,
        readingLevel: selectedChild.reading_level,
        interests: selectedChild.interests ?? [],
        durationMinutes: data.durationMinutes,
        objective: data.objective ?? (selectedChild.objective ?? 'leer_palabras'),
        theme: data.theme,
      },
      data.childId
    )
    if (story) {
      showToast('¡Cuento creado!', 'success')
      navigate(`/leer/${story.id}`)
    } else {
      showToast('No se pudo generar el cuento', 'error')
    }
  }

  if (loadingChildren) return <LoadingState />

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-warm flex flex-col items-center justify-center gap-6 px-5">
        <div className="text-6xl animate-bounce-gentle">📖</div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black text-primary">Creando el cuento</h2>
          <p className="text-neutral-500 text-sm">
            La IA está escribiendo una historia personalizada...
          </p>
        </div>
        <LoadingState message="Esto tarda unos segundos" />
      </div>
    )
  }

  return (
    <AppShell>
      <div className="px-5 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-2xl bg-white shadow-card">
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <h1 className="text-xl font-black text-neutral-800">Crear cuento</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">¿Para quién?</label>
            <select
              {...register('childId')}
              className="w-full px-4 py-3 rounded-2xl border border-neutral-200 focus:outline-none focus:border-primary text-sm bg-white"
            >
              <option value="">Selecciona un niño</option>
              {children.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.age} años)</option>
              ))}
            </select>
            {errors.childId && <p className="text-xs text-danger">{errors.childId.message}</p>}
            {selectedChild && (
              <p className="text-xs text-neutral-400 mt-1">
                {getLevelObjectiveDescription(selectedChild.reading_level as ReadingLevel)}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Tipo de cuento</label>
            <div className="grid grid-cols-3 gap-2">
              {themes.map(([key, info]) => (
                <label key={key} className="flex flex-col items-center gap-1 p-3 rounded-2xl border-2 border-neutral-200 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 text-center">
                  <input {...register('theme')} type="radio" value={key} className="sr-only" />
                  <span className="text-xl">{info.emoji}</span>
                  <span className="text-xs font-medium text-neutral-700">{info.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">
              Duración: {watch('durationMinutes')} minutos
            </label>
            <input
              {...register('durationMinutes', { valueAsNumber: true })}
              type="range"
              min={3}
              max={20}
              step={1}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-neutral-400">
              <span>3 min</span>
              <span>20 min</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-700">Objetivo (opcional)</label>
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
            disabled={isGenerating}
            className="w-full py-5 rounded-3xl bg-primary text-white font-black text-lg shadow-button disabled:opacity-60 active:scale-95 transition-all flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            Crear cuento con IA
          </button>
        </form>
      </div>
    </AppShell>
  )
}
