/// <reference types="@cloudflare/workers-types" />

// Augment CloudflareEnv with our Wrangler bindings (from worker-configuration.d.ts)
declare global {
  interface CloudflareEnv {
    DB: D1Database;
    KV: KVNamespace;
    R2: R2Bucket;
  }
}

export {};
