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

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? "pending";
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 30;
  const offset = (page - 1) * limit;

  let sql = `
    SELECT r.*, u.nickname AS reporter_nickname, c.nickname AS target_nickname
    FROM reports r
    JOIN users u ON u.id = r.reporter_id
    JOIN coaches c ON c.id = r.target_id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (status === "pending") { sql += " AND (r.detail IS NULL OR r.detail != 'resolved')"; }
  if (status === "resolved") { sql += " AND r.detail = 'resolved'"; }

  sql += " ORDER BY r.created_at DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const rows = await d1.prepare(sql).bind(...params).all();
  return NextResponse.json({ reports: rows.results });
}
