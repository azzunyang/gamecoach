import { NextRequest } from "next/server";

export interface CFEnv {
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
}

export function getCFEnv(req: NextRequest): CFEnv {
  return (req as unknown as { cf: { env: CFEnv } }).cf?.env ?? process.env as unknown as CFEnv;
}

declare global {
  var __env__: CFEnv | undefined; // eslint-disable-line no-var
}

export function getEnv(): CFEnv {
  if (typeof globalThis.__env__ !== "undefined") return globalThis.__env__;
  // In dev, stub with process.env so code won't crash; real bindings come at runtime
  return process.env as unknown as CFEnv;
}
