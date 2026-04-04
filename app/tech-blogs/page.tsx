import Navbar from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export const metadata = {
  title: "Blog — FireClaw",
}

const posts = [
  {
    slug: "launching-fireclaw",
    title: "Introducing FireClaw — Deploy AI Agents in 60 Seconds",
    summary:
      "We built FireClaw to make deploying your own AI assistant as easy as clicking a button. Here's what it does and why we built it.",
    date: "April 4, 2026",
    tag: "Announcement",
  },
  {
    slug: "openclaw-explained",
    title: "What is OpenClaw and Why It Matters",
    summary:
      "OpenClaw is an open-source AI gateway connecting your LLM to 20+ messaging channels. Learn how it works under the hood.",
    date: "April 4, 2026",
    tag: "Technical",
  },
  {
    slug: "vps-vs-shared-hosting",
    title: "Why Dedicated VPS Beats Shared AI Hosting",
    summary:
      "Shared hosting means shared limits. With a dedicated VPS, your agent gets full resources, complete isolation, and zero noisy neighbors.",
    date: "April 4, 2026",
    tag: "Infrastructure",
  },
]

export default function TechBlogs() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-6 py-20">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[3px] text-neutral-400">
            Blog
          </p>
          <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
            Engineering & updates
          </h1>
          <p className="mx-auto mt-3 max-w-md text-[14px] text-neutral-500">
            Technical deep dives, product updates, and infrastructure insights.
          </p>
        </div>

        <div className="mt-12 space-y-4">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="group rounded-2xl border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] font-semibold text-neutral-600">
                  {post.tag}
                </span>
                <span className="text-[12px] text-neutral-400">{post.date}</span>
              </div>
              <h2 className="mt-3 text-[18px] font-bold text-neutral-900 group-hover:text-neutral-700">
                {post.title}
              </h2>
              <p className="mt-2 text-[14px] leading-relaxed text-neutral-500">
                {post.summary}
              </p>
              <Link
                href={`/tech-blogs/${post.slug}`}
                className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-neutral-900 transition-colors hover:text-neutral-600"
              >
                Read more
                <ArrowRight className="size-3.5" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
          <p className="text-[14px] text-neutral-500">
            More articles coming soon. Follow us for updates.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
