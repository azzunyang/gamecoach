import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { createSession } from "@/lib/session";
import { verifyEthSignature } from "@/lib/ethVerify";
import { devKv } from "@/lib/devKv";

export const runtime = "edge";

function kv(): KVNamespace {
  try {
    return getRequestContext().env.KV as KVNamespace;
  } catch {
    return devKv;
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
    const body = await req.json() as {
      address: string;
      signature: string;
      role?: "student" | "coach";
      nickname?: string;
      game_category?: string;
      tier?: string;
    };
    const { address, signature, role, nickname, game_category, tier } = body;

    if (!address || !signature) {
      return NextResponse.json({ error: "address와 signature가 필요합니다" }, { status: 400 });
    }

    const addr = address.toLowerCase();

    // Detect whether we're running on Cloudflare (prod) or locally (dev)
    let isCloudflare = false;
    try { getRequestContext(); isCloudflare = true; } catch { /* local dev */ }

    if (!isCloudflare) {
      // Local dev: skip nonce/sig verification, create session directly
      const fakeId = crypto.randomUUID();
      const res = NextResponse.json({ ok: true, role: role ?? "student" });
      await createSession(res, { userId: fakeId, wallet: addr, role: role ?? "student" });
      return res;
    }

    const ns = kv();

    // Retrieve and consume nonce
    const nonce = await ns.get(`nonce:${addr}`);
    if (!nonce) {
      return NextResponse.json({ error: "nonce가 만료되었습니다. 다시 시도해주세요." }, { status: 400 });
    }
    await ns.delete(`nonce:${addr}`);

    // Verify signature
    const message = `GameCoach 인증 요청\n\nnonce: ${nonce}`;
    if (!verifyEthSignature(message, signature, addr)) {
      return NextResponse.json({ error: "서명 검증에 실패했습니다" }, { status: 401 });
    }

    const d1 = db();

    type UserRow = { id: string; role: string; nickname: string };
    const existing = await d1.prepare("SELECT id, role, nickname FROM users WHERE wallet = ?").bind(addr).first<UserRow>();

    if (!role) {
      // Login flow
      if (!existing) {
        return NextResponse.json({ error: "등록되지 않은 지갑입니다. 회원가입을 먼저 해주세요." }, { status: 404 });
      }
      const res = NextResponse.json({ ok: true, role: existing.role });
      await createSession(res, { userId: existing.id, wallet: addr, role: existing.role as "student" | "coach" });
      return res;
    }

    // Register flow
    if (existing) {
      // Already registered — update role if different, then log in
      let finalRole = existing.role as "student" | "coach";
      if (role !== existing.role) {
        await d1.prepare("UPDATE users SET role = ? WHERE id = ?").bind(role, existing.id).run();
        finalRole = role;
        if (role === "coach") {
          const coachRow = await d1.prepare("SELECT id FROM coaches WHERE id = ?").bind(existing.id).first();
          if (!coachRow) {
            const name = existing.nickname || addr.slice(0, 6) + "..." + addr.slice(-4);
            await d1.prepare(
              `INSERT INTO coaches (id, nickname, game_category, tier, tier_self, price_eth, session_min, created_at)
               VALUES (?, ?, '', '', 1, '0.05', 60, unixepoch())`
            ).bind(existing.id, name).run();
          }
        }
      }
      const res = NextResponse.json({ ok: true, role: finalRole, alreadyRegistered: true });
      await createSession(res, { userId: existing.id, wallet: addr, role: finalRole });
      return res;
    }

    if (!["student", "coach"].includes(role)) {
      return NextResponse.json({ error: "잘못된 역할입니다" }, { status: 400 });
    }

    const userId = crypto.randomUUID();
    const finalNickname = nickname?.trim() || addr.slice(0, 6) + "..." + addr.slice(-4);

    await d1.prepare(
      "INSERT INTO users (id, wallet, role, nickname, created_at) VALUES (?, ?, ?, ?, unixepoch())"
    ).bind(userId, addr, role, finalNickname).run();

    if (role === "coach") {
      await d1.prepare(
        `INSERT INTO coaches (id, nickname, game_category, tier, tier_self, price_eth, session_min, created_at)
         VALUES (?, ?, ?, ?, 1, '0.05', 60, unixepoch())`
      ).bind(userId, finalNickname, game_category ?? "", tier ?? "").run();
    }

    const res = NextResponse.json({ ok: true, role });
    await createSession(res, { userId, wallet: addr, role, nickname: finalNickname });
    return res;
  } catch (e) {
    console.error("wallet auth error:", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
