/**
 * In-memory sliding-window rate limiter.
 * Fine for single-instance deploys (Vercel serverless resets on cold start — acceptable for v1).
 * Migrate to Upstash Redis for multi-instance scaling.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      if (now > entry.resetAt) {
        store.delete(key)
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: number
}

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, limit, resetAt: now + windowMs }
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, limit, resetAt: entry.resetAt }
  }

  entry.count++
  return { allowed: true, remaining: limit - entry.count, limit, resetAt: entry.resetAt }
}

/**
 * Rate limit an API route by user ID + endpoint.
 * Returns a Response if rate limited, null if allowed.
 */
export function rateLimitByUser(
  userId: string,
  endpoint: string,
  limit: number,
  windowMs: number,
): Response | null {
  const key = `${endpoint}:${userId}`
  const result = rateLimit(key, limit, windowMs)

  if (!result.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
        },
      },
    )
  }

  return null
}

/**
 * Rate limit by IP address (for unauthenticated endpoints like registration).
 */
export function rateLimitByIp(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number,
): Response | null {
  const key = `${endpoint}:ip:${ip}`
  const result = rateLimit(key, limit, windowMs)

  if (!result.allowed) {
    return Response.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(result.resetAt),
        },
      },
    )
  }

  return null
}
