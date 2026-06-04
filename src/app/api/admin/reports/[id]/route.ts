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

// PATCH: resolve report (+ optionally verify_tier or suspend coach)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d1 = db();
  if (!d1) return NextResponse.json({ error: "DB 없음" }, { status: 500 });
  if (!(await isAdmin(req, d1))) return NextResponse.json({ error: "권한 없음" }, { status: 403 });

  const body = await req.json() as { action?: string };

  // mark report resolved
  await d1.prepare("UPDATE reports SET detail = 'resolved' WHERE id = ?").bind(id).run();

  if (body.action === "verify_tier") {
    // get target_id from report
    const report = await d1.prepare("SELECT target_id FROM reports WHERE id = ?").bind(id).first() as { target_id: string } | null;
    if (report) {
      await d1.prepare("UPDATE coaches SET tier_self = 0 WHERE id = ?").bind(report.target_id).run();
    }
  }

  return NextResponse.json({ ok: true });
}
