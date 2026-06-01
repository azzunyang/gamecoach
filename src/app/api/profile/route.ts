import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try {
    return getRequestContext().env.DB as D1Database;
  } catch {
    return null as unknown as D1Database;
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

    const body = await req.json() as {
      nickname?: string;
      intro?: string;
      game_category?: string;
      tier?: string;
      price_eth?: string;
      session_min?: number;
    };

    const d1 = db();
    if (!d1) {
      return NextResponse.json({ ok: true });
    }

    if (body.nickname) {
      await d1.prepare("UPDATE users SET nickname = ? WHERE id = ?")
        .bind(body.nickname.trim(), session.userId).run();
    }

    if (session.role === "coach") {
      await d1.prepare(`
        UPDATE coaches SET
          nickname    = COALESCE(?, nickname),
          game_category = COALESCE(?, game_category),
          tier        = COALESCE(?, tier),
          price_eth   = COALESCE(?, price_eth),
          session_min = COALESCE(?, session_min),
          intro       = COALESCE(?, intro)
        WHERE id = ?
      `).bind(
        body.nickname?.trim() ?? null,
        body.game_category ?? null,
        body.tier ?? null,
        body.price_eth ?? null,
        body.session_min ?? null,
        body.intro ?? null,
        session.userId,
      ).run();
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("profile error:", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
