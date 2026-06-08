import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

type LessonState = "PENDING" | "ACCEPTED" | "ACTIVE" | "COMPLETED" | "REJECTED" | "CANCELLED" | "DISPUTED" | "RESOLVED";

const VALID_TRANSITIONS: Record<string, { from: LessonState[]; role: "coach" | "student" | "any" }> = {
  ACCEPTED:   { from: ["PENDING"],   role: "coach" },
  REJECTED:   { from: ["PENDING"],   role: "coach" },
  ACTIVE:     { from: ["ACCEPTED"],  role: "student" },  // student pays balance
  COMPLETED:  { from: ["ACTIVE", "ACCEPTED"],    role: "student" },
  CANCELLED:  { from: ["PENDING", "ACCEPTED"], role: "any" },
  DISPUTED:   { from: ["ACTIVE"],    role: "student" },
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const lesson = await d1.prepare(
    `SELECT l.*,
      cu.nickname as coach_nickname, su.nickname as student_nickname,
      c.game_category, c.price_eth, c.session_min
     FROM lessons l
     JOIN coaches c ON c.id = l.coach_id
     JOIN users cu ON cu.id = c.id
     JOIN users su ON su.id = l.student_id
     WHERE l.id = ?`
  ).bind(id).first();

  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다" }, { status: 404 });

  return NextResponse.json({ lesson });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const lesson = await d1.prepare(
    `SELECT l.*, c.id as coach_user_id
     FROM lessons l JOIN coaches c ON c.id = l.coach_id
     WHERE l.id = ?`
  ).bind(id).first<{ state: LessonState; student_id: string; coach_user_id: string; slot_id: string }>();

  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다" }, { status: 404 });

  const { action, txHash } = await req.json() as { action: LessonState; txHash?: string };
  const transition = VALID_TRANSITIONS[action];

  if (!transition) return NextResponse.json({ error: "잘못된 상태 변경입니다" }, { status: 400 });
  if (!transition.from.includes(lesson.state)) {
    return NextResponse.json({ error: `현재 상태(${lesson.state})에서 ${action}으로 변경할 수 없습니다` }, { status: 409 });
  }

  // Role check
  const isCoach = lesson.coach_user_id === session.userId;
  const isStudent = lesson.student_id === session.userId;
  if (transition.role === "coach" && !isCoach) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  if (transition.role === "student" && !isStudent) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  if (transition.role === "any" && !isCoach && !isStudent) return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });

  const updates: string[] = ["state = ?"];
  const binds: unknown[] = [action];

  if (txHash) { updates.push("tx_hash = ?"); binds.push(txHash); }

  // If cancelled, free up the slot
  if (action === "CANCELLED") {
    await d1.batch([
      d1.prepare(`UPDATE lessons SET ${updates.join(", ")} WHERE id = ?`).bind(...binds, id),
      d1.prepare("UPDATE slots SET is_booked = 0 WHERE id = ?").bind(lesson.slot_id),
    ]);
  } else {
    await d1.prepare(`UPDATE lessons SET ${updates.join(", ")} WHERE id = ?`).bind(...binds, id).run();
  }

  return NextResponse.json({ ok: true });
}
