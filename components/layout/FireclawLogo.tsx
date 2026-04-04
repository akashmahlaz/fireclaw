/**
 * FireClaw logo mark — bold geometric "F" with an angular claw-cut at the stem base.
 * Inline SVG for instant rendering (no network request).
 *
 * Source of truth: /public/logo-mark.svg (512×512)
 * This component renders the same paths scaled to any `size`.
 */
export function FireclawLogo({
  size = 28,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="FireClaw"
    >
      <rect width="512" height="512" rx="112" fill="#F97316" />
      <path
        fillRule="evenodd"
        d="M148 104H364V172H224V232H332V300H224V368L268 408H148Z"
        fill="white"
      />
    </svg>
  )
}
