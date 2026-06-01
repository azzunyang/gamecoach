import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

// GET /api/lessons — returns lessons for current user
export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ lessons: [] });

  const field = session.role === "coach" ? "coach_id" : "student_id";
  const lessons = await d1.prepare(
    `SELECT l.*,
      cu.nickname as coach_nickname, su.nickname as student_nickname,
      c.game_category, c.tier
     FROM lessons l
     JOIN coaches c ON c.id = l.coach_id
     JOIN users cu ON cu.id = c.id
     JOIN users su ON su.id = l.student_id
     WHERE l.${field} = ? ORDER BY l.created_at DESC`
  ).bind(session.role === "coach" ? session.userId : session.userId).all();

  return NextResponse.json({ lessons: lessons.results });
}

// POST /api/lessons — student creates lesson request
export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "수강생만 수업을 신청할 수 있습니다" }, { status: 403 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const { coachId, slotId, txHash, contractAddr, depositEth, balanceEth } = await req.json() as { coachId: string; slotId: string; txHash?: string; contractAddr?: string; depositEth?: string; balanceEth?: string };
  if (!coachId || !slotId) {
    return NextResponse.json({ error: "coachId, slotId가 필요합니다" }, { status: 400 });
  }

  // Check slot is available
  const slot = await d1.prepare("SELECT * FROM slots WHERE id = ? AND is_booked = 0").bind(slotId).first<{ id: string; coach_id: string }>();
  if (!slot || slot.coach_id !== coachId) {
    return NextResponse.json({ error: "슬롯을 찾을 수 없거나 이미 예약되었습니다" }, { status: 409 });
  }

  const lessonId = crypto.randomUUID();
  await d1.batch([
    d1.prepare(
      `INSERT INTO lessons (id, coach_id, student_id, slot_id, contract_addr, tx_hash, state, deposit_eth, balance_eth, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, unixepoch())`
    ).bind(lessonId, coachId, session.userId, slotId, contractAddr ?? null, txHash ?? null, depositEth ?? "0", balanceEth ?? "0"),
    d1.prepare("UPDATE slots SET is_booked = 1 WHERE id = ?").bind(slotId),
  ]);

  return NextResponse.json({ ok: true, lessonId }, { status: 201 });
}
