// In-memory KV fallback for local development (no Cloudflare KV available).
// Both nonce and wallet routes import this so the same Map is shared within the process.

const store = new Map<string, { value: string; expires: number }>();

export const devKv = {
  async get(key: string): Promise<string | null> {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expires) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },
  async put(key: string, value: string, opts?: { expirationTtl?: number }): Promise<void> {
    const ttl = (opts?.expirationTtl ?? 3600) * 1000;
    store.set(key, { value, expires: Date.now() + ttl });
  },
  async delete(key: string): Promise<void> {
    store.delete(key);
  },
} as unknown as KVNamespace;
