import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ messages: [] });

  // Verify user is part of this lesson
  const lesson = await d1.prepare(
    `SELECT l.student_id, c.id as coach_user_id
     FROM lessons l JOIN coaches c ON c.id = l.coach_id
     WHERE l.id = ?`
  ).bind(lessonId).first<{ student_id: string; coach_user_id: string }>();

  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다" }, { status: 404 });
  if (lesson.student_id !== session.userId && lesson.coach_user_id !== session.userId) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const since = req.nextUrl.searchParams.get("since") ?? "0";
  const messages = await d1.prepare(
    `SELECT m.*, u.nickname as sender_nickname
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.lesson_id = ? AND m.created_at > ?
     ORDER BY m.created_at ASC LIMIT 100`
  ).bind(lessonId, parseInt(since)).all();

  return NextResponse.json({ messages: messages.results });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const session = await getSession(req);
  if (!session) return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });

  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB unavailable" }, { status: 503 });

  const lesson = await d1.prepare(
    `SELECT l.student_id, c.id as coach_user_id, l.state
     FROM lessons l JOIN coaches c ON c.id = l.coach_id
     WHERE l.id = ?`
  ).bind(lessonId).first<{ student_id: string; coach_user_id: string; state: string }>();

  if (!lesson) return NextResponse.json({ error: "수업을 찾을 수 없습니다" }, { status: 404 });
  if (lesson.student_id !== session.userId && lesson.coach_user_id !== session.userId) {
    return NextResponse.json({ error: "권한이 없습니다" }, { status: 403 });
  }

  const { body } = await req.json() as { body: string };
  if (!body?.trim()) return NextResponse.json({ error: "메시지 내용이 필요합니다" }, { status: 400 });

  const msgId = crypto.randomUUID();
  await d1.prepare(
    "INSERT INTO messages (id, lesson_id, sender_id, body, created_at) VALUES (?, ?, ?, ?, unixepoch())"
  ).bind(msgId, lessonId, session.userId, body.trim()).run();

  return NextResponse.json({ ok: true, id: msgId }, { status: 201 });
}
