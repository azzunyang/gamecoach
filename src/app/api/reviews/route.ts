import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session || session.role !== "student") {
    return NextResponse.json({ error: "수강생만 리뷰를 작성할 수 있습니다" }, { status: 403 });
  }

  const { lessonId, scoreExplain, scoreComm, scoreTime, scoreCurr, body } = await req.json() as { lessonId: string; scoreExplain: number; scoreComm: number; scoreTime: number; scoreCurr: number; body?: string };

  if (!lessonId || !scoreExplain || !scoreComm || !scoreTime || !scoreCurr) {
    return NextResponse.json({ error: "필수 항목이 누락되었습니다" }, { status: 400 });
  }

  for (const s of [scoreExplain, scoreComm, scoreTime, scoreCurr]) {
    if (s < 1 || s > 5) return NextResponse.json({ error: "점수는 1-5 사이여야 합니다" }, { status: 400 });
  }

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  // Verify lesson belongs to this student and is completed
  const lesson = await d1.prepare(
    "SELECT id, coach_id, state FROM lessons WHERE id = ? AND student_id = ?"
  ).bind(lessonId, session.userId).first<{ id: string; coach_id: string; state: string }>();

  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다" }, { status: 404 });
  if (lesson.state !== "COMPLETED") return NextResponse.json({ error: "완료된 수업만 리뷰를 작성할 수 있습니다" }, { status: 409 });

  // Check for duplicate review
  const existing = await d1.prepare("SELECT id FROM reviews WHERE lesson_id = ?").bind(lessonId).first();
  if (existing) return NextResponse.json({ error: "이미 리뷰를 작성하셨습니다" }, { status: 409 });

  const reviewId = crypto.randomUUID();
  const avg = (scoreExplain + scoreComm + scoreTime + scoreCurr) / 4;

  await d1.batch([
    d1.prepare(
      `INSERT INTO reviews (id, lesson_id, coach_id, student_id, score_explain, score_comm, score_time, score_curr, body, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch())`
    ).bind(reviewId, lessonId, lesson.coach_id, session.userId, scoreExplain, scoreComm, scoreTime, scoreCurr, body ?? null),
    // Update coach average rating
    d1.prepare(
      `UPDATE coaches SET
        review_count = review_count + 1,
        avg_rating = (avg_rating * review_count + ?) / (review_count + 1)
       WHERE id = ?`
    ).bind(avg, lesson.coach_id),
  ]);

  return NextResponse.json({ ok: true, id: reviewId }, { status: 201 });
}
