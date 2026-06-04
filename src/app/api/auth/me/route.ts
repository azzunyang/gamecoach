import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json(null, { status: 401 });

  // 세션 데이터 대신 DB에서 최신 정보 직접 조회
  const d1 = db();
  if (d1) {
    const row = await d1.prepare(
      "SELECT nickname, is_admin FROM users WHERE id = ?"
    ).bind(session.userId).first() as { nickname: string; is_admin: number } | null;

    if (row) {
      return NextResponse.json({
        id: session.userId,
        address: session.wallet ?? "",
        role: session.role,
        nickname: row.nickname || session.nickname || "",
        is_admin: row.is_admin,
      });
    }
  }

  // DB 없으면 세션 데이터로 폴백
  return NextResponse.json({
    id: session.userId,
    address: session.wallet ?? "",
    role: session.role,
    nickname: session.nickname ?? "",
    is_admin: session.is_admin ?? 0,
  });
}
