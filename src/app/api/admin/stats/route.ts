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

export async function GET(req: NextRequest) {
  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });
  if (!(await isAdmin(req, d1))) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const [users, coaches, lessons, reports, lectures] = await Promise.all([
    d1.prepare("SELECT COUNT(*) AS cnt FROM users").first() as Promise<{ cnt: number } | null>,
    d1.prepare("SELECT COUNT(*) AS cnt FROM coaches").first() as Promise<{ cnt: number } | null>,
    d1.prepare("SELECT COUNT(*) AS cnt FROM lessons").first() as Promise<{ cnt: number } | null>,
    d1.prepare("SELECT COUNT(*) AS cnt FROM reports WHERE detail IS NULL OR detail != 'resolved'").first() as Promise<{ cnt: number } | null>,
    d1.prepare("SELECT COUNT(*) AS cnt FROM lectures WHERE is_published = 1").first() as Promise<{ cnt: number } | null>,
  ]);

  return NextResponse.json({
    users: users?.cnt ?? 0,
    coaches: coaches?.cnt ?? 0,
    lessons: lessons?.cnt ?? 0,
    pending_reports: reports?.cnt ?? 0,
    lectures: lectures?.cnt ?? 0,
  });
}
