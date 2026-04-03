"use client"

import { useCallback, useRef, useEffect } from "react"

type SoundType = "keystroke" | "success" | "phase" | "deploy" | "error"

/**
 * Professional terminal sound engine.
 * Uses bandpass-filtered noise for mechanical key clicks,
 * and soft sine tones with reverb-like decay for UI feedback.
 */
export function useTerminalSounds() {
  const ctxRef = useRef<AudioContext | null>(null)
  const lastKeystrokeRef = useRef(0)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext()
    }
    return ctxRef.current
  }, [])

  // Pre-generate a reusable noise buffer
  const getNoiseBuffer = useCallback(() => {
    if (noiseBufferRef.current) return noiseBufferRef.current
    const ctx = getContext()
    const length = ctx.sampleRate * 0.05 // 50ms of noise
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    noiseBufferRef.current = buffer
    return buffer
  }, [getContext])

  useEffect(() => {
    return () => {
      ctxRef.current?.close()
      ctxRef.current = null
      noiseBufferRef.current = null
    }
  }, [])

  /**
   * Mechanical keyboard click — short bandpass-filtered noise burst.
   * Sounds like a Cherry MX key bottoming out.
   */
  const playKeystroke = useCallback((ctx: AudioContext, now: number) => {
    const source = ctx.createBufferSource()
    source.buffer = getNoiseBuffer()

    // Bandpass filter gives the "thock" character
    const bandpass = ctx.createBiquadFilter()
    bandpass.type = "bandpass"
    bandpass.frequency.value = 1800 + Math.random() * 800 // 1800-2600 Hz range
    bandpass.Q.value = 1.2

    // Highpass to remove low rumble
    const highpass = ctx.createBiquadFilter()
    highpass.type = "highpass"
    highpass.frequency.value = 800

    // Very fast envelope — 3ms attack, 12ms decay
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.08 + Math.random() * 0.03, now + 0.003)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.015)

    source.connect(highpass)
    highpass.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(ctx.destination)

    source.start(now)
    source.stop(now + 0.02)
  }, [getNoiseBuffer])

  /**
   * Soft confirmation chime — single sine with gentle overtone.
   * Plays on ✓ checkmark lines.
   */
  const playSuccess = useCallback((ctx: AudioContext, now: number) => {
    // Fundamental
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.value = 880 // A5

    // Soft overtone
    const osc2 = ctx.createOscillator()
    osc2.type = "sine"
    osc2.frequency.value = 1320 // E6 (perfect fifth above)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.04, now + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    const gain2 = ctx.createGain()
    gain2.gain.setValueAtTime(0, now)
    gain2.gain.linearRampToValueAtTime(0.015, now + 0.01)
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    osc.connect(gain)
    osc2.connect(gain2)
    gain.connect(ctx.destination)
    gain2.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.18)
    osc2.start(now)
    osc2.stop(now + 0.15)
  }, [])

  /**
   * Phase transition — subtle low tone with a rising sweep.
   * Plays on [1/4], [2/4] section headers.
   */
  const playPhase = useCallback((ctx: AudioContext, now: number) => {
    const osc = ctx.createOscillator()
    osc.type = "sine"
    osc.frequency.setValueAtTime(330, now) // E4
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.08) // rise to A4

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.035, now + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12)

    // Slight lowpass to keep it mellow
    const filter = ctx.createBiquadFilter()
    filter.type = "lowpass"
    filter.frequency.value = 2000

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.15)
  }, [])

  /**
   * Deploy complete — short ascending 3-note arpeggio.
   * Celebratory but restrained. C5 → E5 → G5.
   */
  const playDeploy = useCallback((ctx: AudioContext, now: number) => {
    const notes = [523, 659, 784] // C5, E5, G5
    const spacing = 0.07

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.value = freq

      const gain = ctx.createGain()
      const t = now + i * spacing
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.05, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, t + (i === 2 ? 0.25 : 0.12))

      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.3)
    })
  }, [])

  const playSound = useCallback(
    (type: SoundType) => {
      if (type === "keystroke") {
        const now = performance.now()
        if (now - lastKeystrokeRef.current < 30) return
        lastKeystrokeRef.current = now
      }

      try {
        const ctx = getContext()
        if (ctx.state === "suspended") {
          ctx.resume()
        }
        const now = ctx.currentTime

        switch (type) {
          case "keystroke":
            playKeystroke(ctx, now)
            break
          case "success":
            playSuccess(ctx, now)
            break
          case "phase":
            playPhase(ctx, now)
            break
          case "deploy":
            playDeploy(ctx, now)
            break
          case "error":
            // Descending minor second
            playPhase(ctx, now) // reuse phase sound as fallback
            break
        }
      } catch {
        // Audio is non-critical
      }
    },
    [getContext, playKeystroke, playSuccess, playPhase, playDeploy]
  )

  return { playSound }
}
