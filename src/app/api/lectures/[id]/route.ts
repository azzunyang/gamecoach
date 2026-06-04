import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  const row = await d1.prepare(`
    SELECT l.*, c.nickname AS coach_nickname, c.tier AS coach_tier,
           c.avg_rating AS coach_avg_rating, c.review_count AS coach_review_count,
           c.intro AS coach_intro
    FROM lectures l JOIN coaches c ON c.id = l.coach_id
    WHERE l.id = ?
  `).bind(id).first();

  if (!row) return NextResponse.json({ error: "없음" }, { status: 404 });

  // 해당 코치의 최근 리뷰
  const coachId = (row as { coach_id: string }).coach_id;
  const reviews = await d1.prepare(`
    SELECT r.*, u.nickname AS student_nickname
    FROM reviews r JOIN users u ON u.id = r.student_id
    WHERE r.coach_id = ? ORDER BY r.created_at DESC LIMIT 5
  `).bind(coachId).all();

  return NextResponse.json({ lecture: row, reviews: reviews.results });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session || session.role !== "coach") {
    return NextResponse.json({ error: "코치 권한 필요" }, { status: 401 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  const lecture = await d1.prepare("SELECT coach_id FROM lectures WHERE id = ?").bind(id).first();
  if (!lecture || (lecture as { coach_id: string }).coach_id !== session.userId) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  const body = await req.json() as Record<string, unknown>;
  const allowed = ["title", "description", "target", "curriculum", "game", "game_category", "price_eth", "duration", "level", "is_published"];
  const sets: string[] = [];
  const vals: unknown[] = [];

  for (const key of allowed) {
    if (key in body) { sets.push(`${key} = ?`); vals.push(body[key]); }
  }
  if (sets.length === 0) return NextResponse.json({ ok: true });

  vals.push(id);
  await d1.prepare(`UPDATE lectures SET ${sets.join(", ")} WHERE id = ?`).bind(...vals).run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session || session.role !== "coach") {
    return NextResponse.json({ error: "코치 권한 필요" }, { status: 401 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  const lecture = await d1.prepare("SELECT coach_id FROM lectures WHERE id = ?").bind(id).first();
  if (!lecture || (lecture as { coach_id: string }).coach_id !== session.userId) {
    return NextResponse.json({ error: "권한 없음" }, { status: 403 });
  }

  await d1.prepare("DELETE FROM wishlist_lectures WHERE lecture_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM lectures WHERE id = ?").bind(id).run();
  return NextResponse.json({ ok: true });
}
