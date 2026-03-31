"use client"

import { useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { BlurFade } from "@/components/ui/blur-fade"

export function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)

  function togglePlay() {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play()
      setIsPlaying(true)
      setTimeout(() => setShowControls(false), 1500)
    } else {
      video.pause()
      setIsPlaying(false)
      setShowControls(true)
    }
  }

  function handleMouseEnter() {
    if (isPlaying) setShowControls(true)
  }

  function handleMouseLeave() {
    if (isPlaying) setShowControls(false)
  }

  return (
    <section className="relative bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <BlurFade inView delay={0}>
          <div className="mb-14 text-center">
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
              Watch
            </p>
            <h2 className="text-[36px] font-black leading-[1.1] tracking-[-0.03em] text-neutral-900 sm:text-[44px] lg:text-[52px]">
              See it in action.
              <br />
              <span className="text-neutral-400">60 seconds, start to finish.</span>
            </h2>
          </div>
        </BlurFade>

        {/* Video card */}
        <BlurFade inView delay={0.1}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7 }}
            className="group relative aspect-video w-full cursor-pointer overflow-hidden rounded-3xl border border-neutral-200/60 bg-neutral-950 shadow-2xl shadow-neutral-200/40"
            onClick={togglePlay}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Video element — replace src with your demo video */}
            <video
              ref={videoRef}
              className="absolute inset-0 size-full object-cover"
              src="/test.mp4"
              loop
              playsInline
              preload="metadata"
              poster="/demo-poster.jpg"
            />

            {/* Controls overlay */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 z-10"
                >
                  {/* Gradient scrim when paused */}
                  {!isPlaying && (
                    <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/5 to-black/50" />
                  )}

                  {/* Play/Pause button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      className="relative"
                    >
                      {/* Pulse ring — paused only */}
                      {!isPlaying && (
                        <div className="absolute -inset-4 animate-ping rounded-full border border-white/20" />
                      )}

                      {/* Outer ring */}
                      <div className="absolute -inset-2.5 rounded-full border-2 border-white/20 backdrop-blur-[2px]" />

                      {/* Main button */}
                      <div
                        className="relative flex size-20 items-center justify-center rounded-full sm:size-24"
                        style={{
                          background:
                            "radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.88) 100%)",
                          boxShadow:
                            "0 12px 48px -4px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.15), inset 0 2px 0 rgba(255,255,255,0.9), inset 0 -1px 2px rgba(0,0,0,0.06)",
                        }}
                      >
                        {/* Glass highlight */}
                        <div
                          className="pointer-events-none absolute left-1/2 top-1 h-[45%] w-[70%] -translate-x-1/2 rounded-full"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 100%)",
                          }}
                        />

                        {isPlaying ? (
                          <div className="relative flex gap-1.5">
                            <div className="h-7 w-1.5 rounded-full bg-neutral-900" />
                            <div className="h-7 w-1.5 rounded-full bg-neutral-900" />
                          </div>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            className="relative ml-1 size-8 text-neutral-900 sm:size-9"
                            fill="currentColor"
                          >
                            <path d="M6.906 4.537A.6.6 0 006 5.053v13.894a.6.6 0 00.906.516l11.723-6.947a.6.6 0 000-1.032L6.906 4.537z" />
                          </svg>
                        )}
                      </div>
                    </motion.div>
                  </div>

                  {/* Bottom info when paused */}
                  {!isPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/55 via-black/15 to-transparent p-6 sm:p-8">
                      <span className="text-[10px] font-semibold uppercase tracking-[2px] text-white/50">
                        Product Demo
                      </span>
                      <p className="mt-1 text-[14px] font-medium text-white/80">
                        Watch a full deploy — from sign-up to a live OpenClaw instance with WhatsApp connected.
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </BlurFade>
      </div>
    </section>
  )
}
