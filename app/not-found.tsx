import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <p className="text-[13px] font-bold uppercase tracking-[3px] text-neutral-400">
        404
      </p>
      <h1 className="mt-3 text-[32px] font-black tracking-[-0.03em] text-neutral-900">
        Page not found
      </h1>
      <p className="mt-2 text-[14px] text-neutral-500">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-neutral-900 px-6 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-neutral-700"
      >
        Back to home
      </Link>
    </div>
  )
}
