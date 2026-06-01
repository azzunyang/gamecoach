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
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const coach = await d1.prepare(
    `SELECT c.*, u.nickname, u.wallet
     FROM coaches c JOIN users u ON u.id = c.id
     WHERE c.id = ?`
  ).bind(id).first();

  if (!coach) return NextResponse.json({ error: "코치를 찾을 수 없습니다" }, { status: 404 });

  const reviews = await d1.prepare(
    `SELECT r.*, u.nickname as student_nickname
     FROM reviews r JOIN users u ON u.id = r.student_id
     WHERE r.coach_id = ? ORDER BY r.created_at DESC LIMIT 20`
  ).bind(id).all();

  return NextResponse.json({ coach, reviews: reviews.results });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session || session.role !== "coach") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const coach = await d1.prepare("SELECT id FROM coaches WHERE id = ?").bind(id).first<{ id: string }>();
  if (!coach || coach.id !== session.userId) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { intro, style, price_eth, session_min, game_category, tier } = await req.json() as { intro: string; style: string; price_eth: string; session_min: number; game_category: string; tier: string };
  await d1.prepare(
    `UPDATE coaches SET intro=?, style=?, price_eth=?, session_min=?, game_category=?, tier=?
     WHERE id=?`
  ).bind(intro, style, price_eth, session_min, game_category, tier, id).run();

  return NextResponse.json({ ok: true });
}
