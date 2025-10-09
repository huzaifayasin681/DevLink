// Simple rate limiting for API routes
// In production, use Redis or similar

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 60 * 1000)
  }

  check(identifier: string, limit: number = 100, windowMs: number = 60000): boolean {
    const now = Date.now()
    const entry = this.requests.get(identifier)

    if (!entry || now > entry.resetTime) {
      // New window
      this.requests.set(identifier, {
        count: 1,
        resetTime: now + windowMs,
      })
      return true
    }

    if (entry.count >= limit) {
      return false
    }

    entry.count++
    return true
  }

  getRemainingRequests(identifier: string, limit: number = 100): number {
    const entry = this.requests.get(identifier)
    if (!entry) return limit
    return Math.max(0, limit - entry.count)
  }

  getResetTime(identifier: string): number | null {
    const entry = this.requests.get(identifier)
    return entry ? entry.resetTime : null
  }

  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.requests.clear()
  }
}

const globalForRateLimit = globalThis as unknown as {
  rateLimiter: RateLimiter | undefined
}

export const rateLimiter = globalForRateLimit.rateLimiter ?? new RateLimiter()

if (process.env.NODE_ENV !== 'production') {
  globalForRateLimit.rateLimiter = rateLimiter
}

// Helper function for API routes
export function checkRateLimit(
  identifier: string,
  limit: number = 100,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number | null } {
  const success = rateLimiter.check(identifier, limit, windowMs)
  const remaining = rateLimiter.getRemainingRequests(identifier, limit)
  const resetTime = rateLimiter.getResetTime(identifier)

  return { success, remaining, resetTime }
}
