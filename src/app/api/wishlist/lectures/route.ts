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
  if (!session) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ lectures: [] });

  const rows = await d1.prepare(`
    SELECT l.*, c.nickname AS coach_nickname, c.tier AS coach_tier, c.avg_rating AS coach_avg_rating
    FROM wishlist_lectures w
    JOIN lectures l ON l.id = w.lecture_id
    JOIN coaches c ON c.id = l.coach_id
    WHERE w.user_id = ?
    ORDER BY l.created_at DESC
  `).bind(session.userId).all();

  return NextResponse.json({ lectures: rows.results });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  const { lecture_id } = await req.json() as { lecture_id?: string };
  if (!lecture_id) return NextResponse.json({ error: "lecture_id 필요" }, { status: 400 });

  await d1.prepare(
    "INSERT OR IGNORE INTO wishlist_lectures (user_id, lecture_id) VALUES (?, ?)"
  ).bind(session.userId, lecture_id).run();

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인 필요" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  const { lecture_id } = await req.json() as { lecture_id?: string };
  if (!lecture_id) return NextResponse.json({ error: "lecture_id 필요" }, { status: 400 });

  await d1.prepare(
    "DELETE FROM wishlist_lectures WHERE user_id = ? AND lecture_id = ?"
  ).bind(session.userId, lecture_id).run();

  return NextResponse.json({ ok: true });
}
