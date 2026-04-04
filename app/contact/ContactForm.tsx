"use client"

import { useState } from "react"
import { Mail, MessageSquare, Send, Loader2, CheckCircle } from "lucide-react"

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // For v1, mailto fallback — replace with API route later
    window.location.href = `mailto:support@fireclaw.ai?subject=Contact from ${encodeURIComponent(name)}&body=${encodeURIComponent(`From: ${name} (${email})\n\n${message}`)}`

    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 500)
  }

  return (
    <div className="mt-12 grid gap-8 lg:grid-cols-5">
      {/* Contact info */}
      <div className="space-y-6 lg:col-span-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <Mail className="size-5 text-neutral-900" />
          <h3 className="mt-3 text-[14px] font-bold text-neutral-900">Email</h3>
          <a
            href="mailto:support@fireclaw.ai"
            className="mt-1 block text-[13px] text-neutral-500 transition-colors hover:text-neutral-900"
          >
            support@fireclaw.ai
          </a>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <MessageSquare className="size-5 text-neutral-900" />
          <h3 className="mt-3 text-[14px] font-bold text-neutral-900">Community</h3>
          <p className="mt-1 text-[13px] text-neutral-500">
            Join our Discord for real-time help and updates.
          </p>
        </div>
      </div>

      {/* Contact form */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 lg:col-span-3">
        {sent ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle className="size-10 text-emerald-500" />
            <h3 className="mt-4 text-[16px] font-bold text-neutral-900">
              Message sent!
            </h3>
            <p className="mt-2 text-[14px] text-neutral-500">
              We&apos;ll get back to you as soon as possible.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                Name
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">
                Message
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="How can we help?"
                className="w-full resize-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              />
            </label>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 py-3 text-[14px] font-semibold text-white transition-all hover:bg-neutral-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
