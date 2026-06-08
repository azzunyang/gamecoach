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
      cu.nickname AS coach_nickname,
      su.nickname AS student_nickname,
      c.game_category,
      c.session_min  AS session,
      COALESCE(s.date || ' ' || s.start_time, '') AS slot,
      (CAST(l.deposit_eth AS REAL) + CAST(l.balance_eth AS REAL)) AS price
     FROM lessons l
     JOIN coaches c  ON c.id = l.coach_id
     JOIN users  cu  ON cu.id = c.id
     JOIN users  su  ON su.id = l.student_id
     LEFT JOIN slots s ON s.id = l.slot_id
     WHERE l.${field} = ? ORDER BY l.created_at DESC`
  ).bind(session.userId).all();

  return NextResponse.json({ lessons: lessons.results });
}

// POST /api/lessons — create lesson request
export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session) {
      return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
    }

    const d1 = db();
    if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

    const body = await req.json() as {
      coachId: string; slotId?: string; date?: string; time?: string;
      goal?: string; txHash?: string; contractAddr?: string; depositEth?: string; balanceEth?: string;
    };
    const { coachId, date, time, goal, txHash, contractAddr, depositEth, balanceEth } = body;

    if (!coachId) {
      return NextResponse.json({ error: "coachId가 필요합니다" }, { status: 400 });
    }

    // 자기 자신의 강의는 신청 불가
    if (coachId === session.userId) {
      return NextResponse.json({ error: "본인 강의는 신청할 수 없습니다" }, { status: 400 });
    }

    let finalSlotId = body.slotId;

    if (finalSlotId) {
      const slot = await d1.prepare("SELECT * FROM slots WHERE id = ? AND is_booked = 0").bind(finalSlotId).first<{ id: string; coach_id: string }>();
      if (!slot || slot.coach_id !== coachId) {
        return NextResponse.json({ error: "슬롯을 찾을 수 없거나 이미 예약되었습니다" }, { status: 409 });
      }
      await d1.prepare("UPDATE slots SET is_booked = 1 WHERE id = ?").bind(finalSlotId).run();
    } else {
      // 날짜·시간으로 슬롯 자동 생성
      finalSlotId = crypto.randomUUID();
      const slotDate = date ?? new Date().toISOString().split("T")[0];
      const slotTime = time ?? "00:00";
      await d1.prepare(
        "INSERT INTO slots (id, coach_id, date, start_time, end_time, is_booked) VALUES (?, ?, ?, ?, ?, 1)"
      ).bind(finalSlotId, coachId, slotDate, slotTime, slotTime).run();
    }

    const lessonId = crypto.randomUUID();
    await d1.prepare(
      `INSERT INTO lessons (id, coach_id, student_id, slot_id, contract_addr, tx_hash, state, deposit_eth, balance_eth, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?, ?, unixepoch())`
    ).bind(lessonId, coachId, session.userId, finalSlotId, contractAddr ?? "", txHash ?? null, depositEth ?? "0", balanceEth ?? "0").run();

    // 코치에게 알림 저장
    try {
      await d1.prepare(
        "INSERT INTO notifications (id, user_id, type, payload, is_read, created_at) VALUES (?, ?, 'NEW_LESSON', ?, 0, unixepoch())"
      ).bind(crypto.randomUUID(), coachId, JSON.stringify({ lessonId, goal: goal ?? "" })).run();
    } catch { /* 알림 실패는 무시 */ }

    return NextResponse.json({ ok: true, lessonId }, { status: 201 });
  } catch (e) {
    console.error("lesson post error:", e);
    return NextResponse.json({ error: "수업 신청 중 오류가 발생했습니다" }, { status: 500 });
  }
}
