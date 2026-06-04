import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const q = searchParams.get("q");
  const category = searchParams.get("category");
  const coachId = searchParams.get("coach_id");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const offset = (page - 1) * limit;

  const d1 = db();
  if (!d1) return NextResponse.json({ lectures: [], total: 0 });

  // 코치가 자신의 강의 조회 시 비공개 포함
  const session = await getSession(req);
  const isOwner = coachId && session?.userId === coachId;

  let sql = `
    SELECT l.*, c.nickname AS coach_nickname, c.tier AS coach_tier, c.avg_rating AS coach_avg_rating
    FROM lectures l
    JOIN coaches c ON c.id = l.coach_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (!isOwner) {
    sql += " AND l.is_published = 1";
  }

  if (q) {
    sql += " AND (l.title LIKE ? OR l.game LIKE ? OR c.nickname LIKE ?)";
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) { sql += " AND l.game_category = ?"; params.push(category); }
  if (coachId) { sql += " AND l.coach_id = ?"; params.push(coachId); }

  sql += " ORDER BY l.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const rows = await d1.prepare(sql).bind(...params).all();
  return NextResponse.json({ lectures: rows.results, total: rows.results.length });
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "coach") {
    return NextResponse.json({ error: "코치 권한 필요" }, { status: 401 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });

  const body = await req.json() as {
    title?: string; description?: string; target?: string; curriculum?: string;
    game?: string; game_category?: string; price_eth?: string; duration?: number; level?: string;
  };

  if (!body.title?.trim() || !body.game || !body.game_category || !body.price_eth) {
    return NextResponse.json({ error: "필수 항목 누락" }, { status: 400 });
  }

  const id = crypto.randomUUID();
  await d1.prepare(`
    INSERT INTO lectures (id, coach_id, title, description, target, curriculum, game, game_category, price_eth, duration, level, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
  `).bind(
    id, session.userId, body.title.trim(), body.description ?? null,
    body.target ?? null, body.curriculum ?? null,
    body.game, body.game_category, body.price_eth,
    body.duration ?? 60, body.level ?? '전체'
  ).run();

  return NextResponse.json({ id }, { status: 201 });
}
