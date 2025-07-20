// Simple in-memory cache service with TTL support
interface CacheItem<T> {
  data: T;
  expiresAt: number;
}

class InMemoryCache {
  private cache = new Map<string, CacheItem<any>>();

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // Check if expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * Set data in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttlSeconds TTL in seconds (default 6 hours)
   */
  set<T>(key: string, data: T, ttlSeconds: number = 6 * 60 * 60): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000);
    
    this.cache.set(key, {
      data,
      expiresAt
    });

    console.log(`Cache set: ${key} (TTL: ${ttlSeconds}s, Expires: ${new Date(expiresAt).toISOString()})`);
  }

  /**
   * Check if key exists and is not expired
   * @param key Cache key
   * @returns true if key exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Clear specific key from cache
   * @param key Cache key to clear
   */
  delete(key: string): boolean {
    console.log(`Cache cleared: ${key}`);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    console.log('Cache cleared: All entries');
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    const validEntries = entries.filter(([_, item]) => now <= item.expiresAt);
    const expiredEntries = entries.length - validEntries.length;

    return {
      totalEntries: entries.length,
      validEntries: validEntries.length,
      expiredEntries,
      memoryUsage: process.memoryUsage(),
      keys: validEntries.map(([key, item]) => ({
        key,
        expiresAt: new Date(item.expiresAt).toISOString(),
        dataSize: JSON.stringify(item.data).length
      }))
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): number {
    const now = Date.now();
    let cleanedCount = 0;
    const entries = Array.from(this.cache.entries());

    for (let i = 0; i < entries.length; i++) {
      const [key, item] = entries[i];
      if (now > item.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`Cache cleanup: Removed ${cleanedCount} expired entries`);
    }

    return cleanedCount;
  }
}

// Export singleton instance
export const cacheService = new InMemoryCache();

// Set up periodic cleanup (every hour)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    cacheService.cleanup();
  }, 60 * 60 * 1000); // 1 hour
}