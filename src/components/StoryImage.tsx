import { useState, useEffect } from 'react'

const STYLE_PREFIX =
  'cute children book illustration, watercolor, soft pastel colors, friendly cartoon characters, cozy and warm, high quality,'

export function buildImageUrl(text: string, seed: number): string {
  const prompt = `${STYLE_PREFIX} ${text.substring(0, 150)}`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=420&seed=${seed}&nologo=true&model=flux&safe=true`
}

interface StoryImageProps {
  text: string
  seed: number
}

export function StoryImage({ text, seed }: StoryImageProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoaded(false)
    setError(false)
  }, [text, seed])

  const url = buildImageUrl(text, seed)

  if (error) return null

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-warm border border-neutral-100"
      style={{ aspectRatio: '2 / 1' }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <p className="text-xs text-neutral-400">Preparando ilustración...</p>
        </div>
      )}
      <img
        src={url}
        alt="Ilustración del cuento"
        className={`w-full h-full object-cover transition-opacity duration-700 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </div>
  )
}
