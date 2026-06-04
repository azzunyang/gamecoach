import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession, destroySession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  // 진행 중 수업 있으면 탈퇴 불가
  const active = await d1.prepare(`
    SELECT COUNT(*) AS cnt FROM lessons
    WHERE (coach_id = ? OR student_id = ?)
    AND state IN ('PENDING','ACCEPTED','ACTIVE')
  `).bind(session.userId, session.userId).first() as { cnt: number } | null;

  if (active && active.cnt > 0) {
    return NextResponse.json({ error: "진행 중인 수업이 있어 탈퇴할 수 없습니다" }, { status: 409 });
  }

  // 관련 데이터 삭제 순서 (FK 고려)
  await d1.prepare("DELETE FROM wishlist_lectures WHERE user_id = ?").bind(session.userId).run();
  await d1.prepare("DELETE FROM wishlist WHERE user_id = ?").bind(session.userId).run();
  await d1.prepare("DELETE FROM notifications WHERE user_id = ?").bind(session.userId).run();
  await d1.prepare("DELETE FROM messages WHERE sender_id = ?").bind(session.userId).run();

  if (session.role === "coach") {
    await d1.prepare("DELETE FROM lectures WHERE coach_id = ?").bind(session.userId).run();
    await d1.prepare("DELETE FROM slots WHERE coach_id = ?").bind(session.userId).run();
    await d1.prepare("DELETE FROM coaches WHERE id = ?").bind(session.userId).run();
  }

  await d1.prepare("DELETE FROM users WHERE id = ?").bind(session.userId).run();

  const res = NextResponse.json({ ok: true });
  await destroySession(req, res);
  return res;
}
