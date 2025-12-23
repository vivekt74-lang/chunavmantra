// src/lib/cache.ts
class ApiCache {
    private cache = new Map<string, { data: any; timestamp: number }>();
    private defaultTTL = 5 * 60 * 1000; // 5 minutes

    set(key: string, data: any, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now() + (ttl || this.defaultTTL)
        });
    }

    get(key: string): any | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        if (Date.now() > cached.timestamp) {
            this.cache.delete(key);
            return null;
        }

        return cached.data;
    }

    delete(key: string): void {
        this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }
}

export const apiCache = new ApiCache();