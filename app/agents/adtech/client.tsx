"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Flame,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  FileSearch,
  BarChart3,
  Layers,
} from "lucide-react";

interface AdTechPageProps {
  user: { name: string | null; email: string | null } | null;
}

const CAPABILITIES = [
  "Processes Android apps, iOS apps, and websites in bulk",
  "Fetches and parses ads.txt / app-ads.txt files",
  "Verifies supply chain via sellers.json cross-referencing",
  "Spawns parallel sub-agents for 5,000+ entry batches",
  "Outputs structured Excel-ready compliance reports",
];

const FEATURES = [
  {
    icon: FileSearch,
    title: "Bulk Verification",
    desc: "Process thousands of apps and domains in one session. The agent handles batching and retries automatically.",
  },
  {
    icon: Layers,
    title: "Full Chain Audit",
    desc: "ads.txt → sellers.json → cross-reference. Complete supply chain transparency in one report.",
  },
  {
    icon: BarChart3,
    title: "Excel Reports",
    desc: "Structured output ready for your team. Compliance status, discrepancies, and action items.",
  },
  {
    icon: Shield,
    title: "Dedicated Infrastructure",
    desc: "Runs on its own VPS with dedicated resources. No rate limits from shared infrastructure.",
  },
  {
    icon: Zap,
    title: "Parallel Processing",
    desc: "Spawns sub-agents for large batches. 5,000+ entries processed concurrently.",
  },
  {
    icon: Globe,
    title: "Your Subdomain",
    desc: "Access your agent at yourname.fireclaw.ai with auto-provisioned HTTPS.",
  },
];

export function AdTechPage({ user }: AdTechPageProps) {
  const router = useRouter();
  const [agentName, setAgentName] = useState("");
  const [deploying, setDeploying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeploy = useCallback(async () => {
    if (!user) {
      router.push("/auth/signin?callbackUrl=/agents/adtech");
      return;
    }
    if (!agentName.trim() || agentName.trim().length < 2) {
      setError("Give your agent a name (at least 2 characters)");
      return;
    }

    setDeploying(true);
    setError(null);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: agentName.trim(),
          template: "ad-chain-verify",
          planId: "growth",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Deploy failed");

      router.push(`/dashboard/agents/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setDeploying(false);
    }
  }, [user, agentName, router]);

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
            <Flame className="size-4 text-white" />
          </div>
          <span className="text-[15px] font-bold text-stone-900">FireClaw</span>
        </Link>
        {user ? (
          <Link
            href="/dashboard"
            className="text-[13px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            Dashboard →
          </Link>
        ) : (
          <Link
            href="/auth/signin"
            className="text-[13px] font-medium text-stone-500 hover:text-stone-900 transition-colors"
          >
            Sign in
          </Link>
        )}
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1 text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-6">
          <span className="text-base">📡</span>
          Ad Operations
        </div>

        <h1 className="font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[1.05] text-stone-900 mb-4">
          Ad-Chain Verify Agent
        </h1>
        <p className="text-[17px] text-stone-500 max-w-xl mx-auto leading-relaxed mb-2">
          Crawl ads.txt, app-ads.txt, and sellers.json at scale.
          Verify programmatic supply chains across thousands of apps and websites.
        </p>
        <p className="text-[14px] text-stone-400">
          Starting at <span className="font-semibold text-stone-900">$21/month</span>
        </p>
      </section>

      {/* Capabilities */}
      <section className="px-6 pb-12 max-w-2xl mx-auto">
        <div className="rounded-xl border border-stone-200 bg-white p-6">
          <p className="text-[12px] font-semibold text-stone-500 uppercase tracking-wider mb-4">
            What this agent does
          </p>
          <ul className="space-y-3">
            {CAPABILITIES.map((cap) => (
              <li key={cap} className="flex items-start gap-2.5 text-[14px] text-stone-700">
                <Check className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                {cap}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Deploy Form */}
      <section className="px-6 pb-20 max-w-2xl mx-auto">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          <h2 className="text-[18px] font-semibold text-stone-900 mb-6">
            Deploy your Ad-Chain verifier
          </h2>

          {/* Agent name */}
          <div className="mb-8">
            <label className="block text-[13px] font-medium text-stone-700 mb-2">
              Agent name
            </label>
            <input
              type="text"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              placeholder="e.g. BeMatterfull AdTech"
              className="w-full h-11 rounded-lg border border-stone-200 bg-white px-4 text-[14px] text-stone-900 placeholder:text-stone-400 transition-colors focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-900/5"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          )}

          {/* Deploy button */}
          <button
            onClick={handleDeploy}
            disabled={deploying}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-6 py-3.5 text-[14px] font-semibold text-white transition-all hover:bg-stone-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deploying ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deploying...
              </>
            ) : user ? (
              <>
                Deploy Agent
                <ArrowRight className="size-4" />
              </>
            ) : (
              <>
                <Lock className="size-3.5" />
                Sign in to Deploy
              </>
            )}
          </button>

          <p className="mt-3 text-center text-[11px] text-stone-400">
            Growth plan required. Live in ~5 minutes on dedicated infrastructure.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 pb-24 max-w-4xl mx-auto">
        <h2 className="font-display text-[1.75rem] text-stone-900 text-center mb-10">
          Built for ad operations
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="space-y-2">
              <f.icon className="size-5 text-orange-500" />
              <h3 className="text-[14px] font-semibold text-stone-900">{f.title}</h3>
              <p className="text-[13px] text-stone-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
