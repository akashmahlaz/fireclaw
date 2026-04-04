/**
 * FireClaw "F" mark — inline SVG, no external files.
 * A bold geometric "F" with a subtle claw notch at the bottom-right.
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
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Fireclaw logo"
    >
      <rect width="32" height="32" rx="8" fill="#F97316" />
      <path
        d="M10 8h12v3.5H14.5v3h6v3.5h-6v6H10V8Z"
        fill="white"
      />
    </svg>
  )
}
