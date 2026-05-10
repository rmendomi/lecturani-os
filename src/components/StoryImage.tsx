import { useState, useEffect } from 'react'

const STYLE_PREFIX =
  'cute children book illustration, watercolor, soft pastel colors, friendly cartoon characters, cozy and warm, high quality,'

export function buildImageUrl(text: string, seed: number): string {
  const prompt = `${STYLE_PREFIX} ${text.substring(0, 150)}`
  // model=turbo: genera en 2-5 segundos (flux tarda 30+)
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=420&seed=${seed}&nologo=true&model=turbo`
}

interface StoryImageProps {
  text: string
  seed: number
}

export function StoryImage({ text, seed }: StoryImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading')

  useEffect(() => {
    setStatus('loading')
  }, [text, seed])

  const url = buildImageUrl(text, seed)

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-warm border border-neutral-100"
      style={{ aspectRatio: '2/1' }}
    >
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex gap-1.5">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2.5 h-2.5 bg-primary/40 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-400">Preparando ilustración...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-40">
          <span className="text-5xl">🎨</span>
          <p className="text-xs text-neutral-500">Sin ilustración</p>
        </div>
      )}

      <img
        src={url}
        alt="Ilustración del cuento"
        className={`w-full h-full object-cover transition-opacity duration-700 ${status === 'loaded' ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </div>
  )
}
