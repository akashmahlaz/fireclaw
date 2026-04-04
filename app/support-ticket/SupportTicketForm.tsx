"use client"

import { useState } from "react"
import { Loader2, CheckCircle, Send } from "lucide-react"

const categories = [
  "Billing & Payments",
  "Agent Deployment",
  "Account Issues",
  "Server Problems",
  "Feature Request",
  "Other",
]

export function SupportTicketForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [category, setCategory] = useState("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // v1: mailto fallback — replace with API route + ticketing system later
    window.location.href = `mailto:support@fireclaw.ai?subject=${encodeURIComponent(`[${category}] ${subject}`)}&body=${encodeURIComponent(`From: ${name} (${email})\nCategory: ${category}\n\n${description}`)}`

    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 500)
  }

  return (
    <div className="mt-10 rounded-2xl border border-neutral-200 bg-white p-8">
      {sent ? (
        <div className="flex flex-col items-center py-10 text-center">
          <CheckCircle className="size-10 text-emerald-500" />
          <h3 className="mt-4 text-[16px] font-bold text-neutral-900">Ticket submitted!</h3>
          <p className="mt-2 text-[14px] text-neutral-500">
            We&apos;ll respond to your email within 24 hours.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">Name</span>
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
              <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">Category</span>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">Subject</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              placeholder="Brief description of the issue"
              className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-[14px] text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-neutral-700">
              Description
            </span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={6}
              placeholder="Please include as much detail as possible — error messages, steps to reproduce, agent name, etc."
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
            Submit ticket
          </button>
        </form>
      )}
    </div>
  )
}
