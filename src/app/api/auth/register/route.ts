import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createSession } from "@/lib/session";

export const runtime = "edge";

function kv(): KVNamespace {
  try {
    return getRequestContext().env.KV as KVNamespace;
  } catch {
    return {
      get: async () => null,
      put: async () => undefined,
      delete: async () => undefined,
    } as unknown as KVNamespace;
  }
}

function db(): D1Database {
  try {
    return getRequestContext().env.DB as D1Database;
  } catch {
    return null as unknown as D1Database;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { phone, role, nickname, game_category, tier } = await req.json() as { phone: string; role: "student" | "coach"; nickname: string; game_category?: string; tier?: string };

    if (!phone || !role || !nickname) {
      return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 });
    }
    if (!["student", "coach"].includes(role)) {
      return NextResponse.json({ error: "잘못된 역할입니다" }, { status: 400 });
    }

    const DEMO_PHONES = new Set(["01000000000", "01011111111", "01022222222"]);

    const ns = kv();
    if (!DEMO_PHONES.has(phone)) {
      const verified = await ns.get(`verified:${phone}`);
      if (!verified) {
        return NextResponse.json({ error: "휴대폰 인증이 필요합니다" }, { status: 403 });
      }
    }

    const d1 = db();
    if (!d1) {
      const fakeId = crypto.randomUUID();
      const res = NextResponse.json({ ok: true });
      await createSession(res, { userId: fakeId, phone, role });
      return res;
    }

    const existing = await d1.prepare("SELECT id FROM users WHERE phone = ?").bind(phone).first<{ id: string }>();
    if (existing) {
      return NextResponse.json({ error: "이미 가입된 번호입니다" }, { status: 409 });
    }

    const userId = crypto.randomUUID();
    await d1.prepare(
      "INSERT INTO users (id, phone, role, nickname, created_at) VALUES (?, ?, ?, ?, unixepoch())"
    ).bind(userId, phone, role, nickname).run();

    if (role === "coach") {
      await d1.prepare(
        `INSERT INTO coaches (id, nickname, game_category, tier, tier_self, price_eth, session_min, created_at)
         VALUES (?, ?, ?, ?, 1, '0.05', 60, unixepoch())`
      ).bind(userId, nickname, game_category ?? "", tier ?? "").run();
    }

    if (!DEMO_PHONES.has(phone)) {
      await ns.delete(`verified:${phone}`);
    }

    const res = NextResponse.json({ ok: true });
    await createSession(res, { userId, phone, role });
    return res;
  } catch (e) {
    console.error("register error:", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
