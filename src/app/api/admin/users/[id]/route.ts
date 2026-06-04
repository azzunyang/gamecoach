import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

async function isAdmin(req: NextRequest, d1: D1Database): Promise<boolean> {
  const session = await getSession(req);
  if (!session) return false;
  const user = await d1.prepare("SELECT is_admin FROM users WHERE id = ?")
    .bind(session.userId).first() as { is_admin: number } | null;
  return (user?.is_admin ?? 0) === 1;
}

// PATCH: ban, unban, promote/demote admin
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });
  if (!(await isAdmin(req, d1))) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json() as { action?: string };
  if (body.action === "ban") {
    await d1.prepare("UPDATE users SET role = 'student', wallet = NULL WHERE id = ?").bind(id).run();
  } else if (body.action === "promote_admin") {
    await d1.prepare("UPDATE users SET is_admin = 1 WHERE id = ?").bind(id).run();
  } else if (body.action === "demote_admin") {
    await d1.prepare("UPDATE users SET is_admin = 0 WHERE id = ?").bind(id).run();
  } else {
    return NextResponse.json({ error: "알 수 없는 action" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

// DELETE: hard delete user (진행 중 수업 없을 때)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });
  if (!(await isAdmin(req, d1))) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const active = await d1.prepare(`
    SELECT COUNT(*) AS cnt FROM lessons
    WHERE (coach_id = ? OR student_id = ?) AND state IN ('PENDING','ACCEPTED','ACTIVE')
  `).bind(id, id).first() as { cnt: number } | null;

  if (active && active.cnt > 0) {
    return NextResponse.json({ error: "진행 중 수업 있음" }, { status: 409 });
  }

  await d1.prepare("DELETE FROM wishlist_lectures WHERE user_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM wishlist WHERE user_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM notifications WHERE user_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM messages WHERE sender_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM lectures WHERE coach_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM slots WHERE coach_id = ?").bind(id).run();
  await d1.prepare("DELETE FROM coaches WHERE id = ?").bind(id).run();
  await d1.prepare("DELETE FROM users WHERE id = ?").bind(id).run();

  return NextResponse.json({ ok: true });
}
