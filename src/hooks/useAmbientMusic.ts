import { useRef, useState, useCallback, useEffect } from 'react'

// Frecuencias en Hz — una escala pentatónica por tema
const THEME_NOTES: Record<string, number[]> = {
  antes_de_dormir: [261.63, 293.66, 329.63, 392.00, 440.00],  // C mayor pentatónica, suave
  aventura:        [220.00, 246.94, 293.66, 329.63, 392.00],  // A menor pentatónica
  animales:        [293.66, 329.63, 392.00, 440.00, 587.33],  // D mayor, brillante
  colegio:         [349.23, 392.00, 440.00, 523.25, 587.33],  // F mayor, amigable
  emociones:       [246.94, 293.66, 329.63, 370.00, 440.00],  // B menor, expresiva
  fantasia:        [261.63, 311.13, 369.99, 415.30, 493.88],  // C# menor, mágica
  personalizado:   [261.63, 293.66, 329.63, 392.00, 440.00],
}
const DEFAULT_NOTES = [261.63, 293.66, 329.63, 392.00, 440.00]

// Patrón de arpegio: sube y baja con variación
const PATTERN = [0, 1, 2, 3, 4, 3, 2, 1, 0, 2, 4, 2]
const INTERVAL_MS = 900  // ~67 BPM

export function useAmbientMusic(theme: string | null | undefined) {
  const [isPlaying, setIsPlaying] = useState(false)
  const ctxRef = useRef<AudioContext | null>(null)
  const masterRef = useRef<GainNode | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepRef = useRef(0)
  const activeRef = useRef(false)
  const notesRef = useRef<number[]>(DEFAULT_NOTES)

  useEffect(() => {
    notesRef.current = THEME_NOTES[theme ?? ''] ?? DEFAULT_NOTES
  }, [theme])

  const tick = useCallback(() => {
    if (!activeRef.current || !ctxRef.current || !masterRef.current) return
    const ctx = ctxRef.current
    const master = masterRef.current
    const notes = notesRef.current

    const noteIdx = PATTERN[stepRef.current % PATTERN.length]
    const freq = notes[noteIdx]

    // Nota principal (octava normal)
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.connect(env)
    env.connect(master)
    osc.type = 'sine'
    osc.frequency.value = freq

    const t = ctx.currentTime
    env.gain.setValueAtTime(0, t)
    env.gain.linearRampToValueAtTime(0.10, t + 0.12)
    env.gain.exponentialRampToValueAtTime(0.001, t + 1.6)
    osc.start(t)
    osc.stop(t + 1.7)

    // Armónico suave (octava arriba, más quieto) cada 3 pasos
    if (stepRef.current % 3 === 0) {
      const osc2 = ctx.createOscillator()
      const env2 = ctx.createGain()
      osc2.connect(env2)
      env2.connect(master)
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2

      env2.gain.setValueAtTime(0, t)
      env2.gain.linearRampToValueAtTime(0.04, t + 0.2)
      env2.gain.exponentialRampToValueAtTime(0.001, t + 1.2)
      osc2.start(t)
      osc2.stop(t + 1.3)
    }

    stepRef.current++
    timerRef.current = setTimeout(tick, INTERVAL_MS)
  }, [])

  const start = useCallback(() => {
    if (activeRef.current) return
    const AudioCtx = window.AudioContext
      ?? (window as unknown as Record<string, typeof AudioContext>).webkitAudioContext
    if (!AudioCtx) return

    const ctx = new AudioCtx()
    const master = ctx.createGain()
    master.gain.value = 0.55
    master.connect(ctx.destination)

    // Capa de ruido rosa: textura ambiente suave (como viento leve o lluvia distante)
    const bufSize = ctx.sampleRate * 4
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate)
    const d = buf.getChannelData(0)
    let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0
    for (let i = 0; i < bufSize; i++) {
      const w = Math.random() * 2 - 1
      b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759
      b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856
      b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980
      d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926
    }
    const noiseSource = ctx.createBufferSource()
    noiseSource.buffer = buf
    noiseSource.loop = true
    const noiseGain = ctx.createGain()
    noiseGain.gain.value = 0.018
    noiseSource.connect(noiseGain)
    noiseGain.connect(master)
    noiseSource.start()

    ctxRef.current = ctx
    masterRef.current = master
    activeRef.current = true
    stepRef.current = 0
    setIsPlaying(true)
    tick()
  }, [tick])

  const stop = useCallback(() => {
    activeRef.current = false
    setIsPlaying(false)
    if (timerRef.current) clearTimeout(timerRef.current)
    if (masterRef.current && ctxRef.current) {
      const master = masterRef.current
      const ctx = ctxRef.current
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
      setTimeout(() => {
        ctx.close()
        ctxRef.current = null
        masterRef.current = null
      }, 700)
    }
  }, [])

  const toggle = useCallback(() => {
    if (activeRef.current) stop(); else start()
  }, [start, stop])

  useEffect(() => () => { stop() }, [stop])

  return { isPlaying, toggle }
}
