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

const DEMO_PHONES = new Set(["01000000000", "01011111111", "01022222222"]);
const DEMO_OTP = "000000";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp } = await req.json() as { phone: string; otp: string };

    if (!phone || !otp) {
      return NextResponse.json({ error: "phone과 otp가 필요합니다" }, { status: 400 });
    }

    // 데모 번호: DB/KV 없이 즉시 처리
    if (DEMO_PHONES.has(phone)) {
      if (String(otp) !== DEMO_OTP) {
        return NextResponse.json({ error: "인증번호가 일치하지 않습니다" }, { status: 400 });
      }
      // 데모 계정은 항상 신규 사용자로 처리 (세션 없이 register로 이동)
      return NextResponse.json({ ok: true, isNew: true });
    }

    // 일반 번호: KV에서 OTP 검증
    const ns = kv();
    const stored = await ns.get(`otp:${phone}`);
    if (!stored) {
      return NextResponse.json({ error: "인증번호가 만료되었습니다. 다시 발송해주세요." }, { status: 400 });
    }
    if (stored !== String(otp)) {
      return NextResponse.json({ error: "인증번호가 일치하지 않습니다" }, { status: 400 });
    }
    await ns.delete(`otp:${phone}`);

    // DB에서 기존 유저 확인
    const d1 = db();
    let user: { id: string; phone: string; role: string; nickname: string } | null = null;
    if (d1) {
      user = await d1.prepare("SELECT id, phone, role, nickname FROM users WHERE phone = ?").bind(phone).first();
    }

    if (!user) {
      await ns.put(`verified:${phone}`, "1", { expirationTtl: 900 });
      return NextResponse.json({ ok: true, isNew: true });
    }

    const res = NextResponse.json({ ok: true, isNew: false, role: user.role });
    await createSession(res, {
      userId: user.id,
      phone: user.phone,
      role: user.role as "student" | "coach",
    });
    return res;
  } catch (e) {
    console.error("verify-otp error:", e);
    return NextResponse.json({ error: "서버 오류가 발생했습니다. 다시 시도해주세요." }, { status: 500 });
  }
}
