"use client"

import { useCallback, useRef, useEffect, useState } from "react"

type SoundType = "keystroke" | "success" | "phase" | "deploy" | "error"

/**
 * Terminal sound engine with DynamicsCompressor for perceived loudness.
 *
 * All sounds route through:  source → gain → compressor → masterGain → destination
 *
 * The compressor squashes peaks and boosts quiet transients so short
 * clicks / chimes are audible at normal laptop volume without clipping.
 *
 * `enabled` defaults to false — the consumer component should provide a
 * toggle button so the user's click satisfies Chrome's autoplay policy.
 */
export function useTerminalSounds() {
  const ctxRef = useRef<AudioContext | null>(null)
  const compressorRef = useRef<DynamicsCompressorNode | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const lastKeystrokeRef = useRef(0)
  const noiseBufferRef = useRef<AudioBuffer | null>(null)
  const [enabled, setEnabled] = useState(false)

  /** Build (or return cached) AudioContext + compressor + master gain chain. */
  const getContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current
    const ctx = new AudioContext()

    // DynamicsCompressor: boosts perceived loudness of short transients
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -24 // start compressing at -24 dB
    compressor.knee.value = 12
    compressor.ratio.value = 8
    compressor.attack.value = 0.002
    compressor.release.value = 0.08

    // Master gain — acts as the final volume knob (3× boost)
    const master = ctx.createGain()
    master.gain.value = 3.0

    compressor.connect(master)
    master.connect(ctx.destination)

    ctxRef.current = ctx
    compressorRef.current = compressor
    masterGainRef.current = master
    return ctx
  }, [])

  /** The output node all sounds should connect to (compressor input). */
  const getOutput = useCallback(() => {
    getContext() // ensure chain is built
    return compressorRef.current!
  }, [getContext])

  const getNoiseBuffer = useCallback(() => {
    if (noiseBufferRef.current) return noiseBufferRef.current
    const ctx = getContext()
    const length = ctx.sampleRate * 0.05
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
      compressorRef.current = null
      masterGainRef.current = null
      noiseBufferRef.current = null
    }
  }, [])

  /** Toggle sound on / off. The click that calls this satisfies autoplay. */
  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      if (next) {
        const ctx = getContext()
        if (ctx.state === "suspended") ctx.resume()
      }
      return next
    })
  }, [getContext])

  // ── Sound generators ──────────────────────────────────────────

  const playKeystroke = useCallback(
    (ctx: AudioContext, now: number) => {
      const out = getOutput()
      const source = ctx.createBufferSource()
      source.buffer = getNoiseBuffer()

      const bandpass = ctx.createBiquadFilter()
      bandpass.type = "bandpass"
      bandpass.frequency.value = 1800 + Math.random() * 800
      bandpass.Q.value = 1.2

      const highpass = ctx.createBiquadFilter()
      highpass.type = "highpass"
      highpass.frequency.value = 800

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.5 + Math.random() * 0.15, now + 0.003)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.022)

      source.connect(highpass)
      highpass.connect(bandpass)
      bandpass.connect(gain)
      gain.connect(out)

      source.start(now)
      source.stop(now + 0.03)
    },
    [getNoiseBuffer, getOutput],
  )

  const playSuccess = useCallback(
    (ctx: AudioContext, now: number) => {
      const out = getOutput()

      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.value = 880

      const osc2 = ctx.createOscillator()
      osc2.type = "sine"
      osc2.frequency.value = 1320

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.25, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

      const gain2 = ctx.createGain()
      gain2.gain.setValueAtTime(0, now)
      gain2.gain.linearRampToValueAtTime(0.1, now + 0.01)
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      osc.connect(gain)
      osc2.connect(gain2)
      gain.connect(out)
      gain2.connect(out)

      osc.start(now)
      osc.stop(now + 0.2)
      osc2.start(now)
      osc2.stop(now + 0.16)
    },
    [getOutput],
  )

  const playPhase = useCallback(
    (ctx: AudioContext, now: number) => {
      const out = getOutput()

      const osc = ctx.createOscillator()
      osc.type = "sine"
      osc.frequency.setValueAtTime(330, now)
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.08)

      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(0.2, now + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14)

      const filter = ctx.createBiquadFilter()
      filter.type = "lowpass"
      filter.frequency.value = 2000

      osc.connect(filter)
      filter.connect(gain)
      gain.connect(out)

      osc.start(now)
      osc.stop(now + 0.18)
    },
    [getOutput],
  )

  const playDeploy = useCallback(
    (ctx: AudioContext, now: number) => {
      const out = getOutput()
      const notes = [523, 659, 784]
      const spacing = 0.07

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = "sine"
        osc.frequency.value = freq

        const gain = ctx.createGain()
        const t = now + i * spacing
        gain.gain.setValueAtTime(0, t)
        gain.gain.linearRampToValueAtTime(0.28, t + 0.01)
        gain.gain.exponentialRampToValueAtTime(0.001, t + (i === 2 ? 0.28 : 0.14))

        osc.connect(gain)
        gain.connect(out)
        osc.start(t)
        osc.stop(t + 0.35)
      })
    },
    [getOutput],
  )

  // ── Public API ────────────────────────────────────────────────

  const playSound = useCallback(
    (type: SoundType) => {
      if (!enabled) return

      if (type === "keystroke") {
        const now = performance.now()
        if (now - lastKeystrokeRef.current < 30) return
        lastKeystrokeRef.current = now
      }

      try {
        const ctx = getContext()
        if (ctx.state === "suspended") ctx.resume()
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
            playPhase(ctx, now)
            break
        }
      } catch {
        // Audio is non-critical
      }
    },
    [enabled, getContext, playKeystroke, playSuccess, playPhase, playDeploy],
  )

  return { playSound, enabled, toggle }
}
