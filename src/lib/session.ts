import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

const SESSION_COOKIE = "gc_session";
const SESSION_TTL = 60 * 60 * 24 * 30; // 30 days

export interface SessionData {
  userId: string;
  phone?: string;
  wallet?: string;
  discordId?: string;
  role: "student" | "coach" | "admin";
  nickname?: string;
  is_admin?: number;
}

function kv(): KVNamespace {
  try {
    return getRequestContext().env.KV as KVNamespace;
  } catch {
    // local dev fallback — in-memory stub
    return {
      get: async () => null,
      put: async () => undefined,
      delete: async () => undefined,
    } as unknown as KVNamespace;
  }
}

export async function getSession(req: NextRequest): Promise<SessionData | null> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const raw = await kv().get(`session:${token}`);
    return raw ? (JSON.parse(raw) as SessionData) : null;
  } catch {
    return null;
  }
}

export async function createSession(res: NextResponse, data: SessionData): Promise<string> {
  const token = crypto.randomUUID();
  await kv().put(`session:${token}`, JSON.stringify(data), { expirationTtl: SESSION_TTL });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL,
    path: "/",
  });
  return token;
}

export async function updateSession(req: NextRequest, patch: Partial<SessionData>): Promise<void> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return;
  try {
    const raw = await kv().get(`session:${token}`);
    if (!raw) return;
    const data = JSON.parse(raw) as SessionData;
    await kv().put(`session:${token}`, JSON.stringify({ ...data, ...patch }), { expirationTtl: SESSION_TTL });
  } catch { /* ignore */ }
}

export async function destroySession(req: NextRequest, res: NextResponse): Promise<void> {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (token) {
    try { await kv().delete(`session:${token}`); } catch { /* ignore */ }
  }
  res.cookies.set(SESSION_COOKIE, "", { maxAge: 0, path: "/" });
}
