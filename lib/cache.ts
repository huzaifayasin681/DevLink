// Simple in-memory cache for development
// In production, replace with Redis or similar

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  set<T>(key: string, data: T, ttl: number = 300): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl * 1000, // Convert to milliseconds
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    const now = Date.now()
    const age = now - entry.timestamp
    
    if (age > entry.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      const age = now - entry.timestamp
      if (age > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }
    this.clear()
  }
}

// Singleton instance
const globalForCache = globalThis as unknown as {
  cache: SimpleCache | undefined
}

export const cache = globalForCache.cache ?? new SimpleCache()

if (process.env.NODE_ENV !== 'production') {
  globalForCache.cache = cache
}

// Helper function for cached database queries
export async function cachedQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttl: number = 300
): Promise<T> {
  const cached = cache.get<T>(key)
  
  if (cached !== null) {
    return cached
  }
  
  const result = await queryFn()
  cache.set(key, result, ttl)
  
  return result
}
