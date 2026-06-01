import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

// GET /api/coaches/[id]/slots?from=2026-06-01&to=2026-06-30
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = req.nextUrl;
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  const d1 = db();
  if (!d1) return NextResponse.json({ slots: [] });

  const slots = await d1.prepare(
    `SELECT * FROM slots WHERE coach_id = ? AND date >= ? AND date <= ? AND is_booked = 0
     ORDER BY date, start_time`
  ).bind(id, from, to).all();

  return NextResponse.json({ slots: slots.results });
}

// POST /api/coaches/[id]/slots — coach creates available time slots
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session || session.role !== "coach") {
    return NextResponse.json({ error: "코치만 슬롯을 생성할 수 있습니다" }, { status: 403 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  // Verify this coach belongs to this session user
  const coach = await d1.prepare("SELECT id FROM coaches WHERE id = ?").bind(id).first<{ id: string }>();
  if (!coach || coach.id !== session.userId) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { date, time } = await req.json() as { date: string; time: string };
  if (!date || !time) return NextResponse.json({ error: "date와 time이 필요합니다" }, { status: 400 });

  const slotId = crypto.randomUUID();
  await d1.prepare(
    "INSERT INTO slots (id, coach_id, date, start_time, end_time, is_booked) VALUES (?, ?, ?, ?, ?, 0)"
  ).bind(slotId, id, date, time, time).run();

  return NextResponse.json({ ok: true, id: slotId });
}

// DELETE /api/coaches/[id]/slots?slotId=xxx
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session || session.role !== "coach") {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const slotId = req.nextUrl.searchParams.get("slotId");
  if (!slotId) return NextResponse.json({ error: "slotId가 필요합니다" }, { status: 400 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const coach = await d1.prepare("SELECT id FROM coaches WHERE id = ?").bind(id).first<{ id: string }>();
  if (!coach || coach.id !== session.userId) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  await d1.prepare("DELETE FROM slots WHERE id = ? AND is_booked = 0").bind(slotId).run();
  return NextResponse.json({ ok: true });
}
