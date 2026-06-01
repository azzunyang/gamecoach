import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

function db(): D1Database {
  try { return getRequestContext().env.DB as D1Database; }
  catch { return null as unknown as D1Database; }
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = 20;
  const offset = (page - 1) * limit;

  const d1 = db();
  if (!d1) {
    return NextResponse.json({ coaches: [], total: 0 });
  }

  let sql = `
    SELECT c.*, u.wallet
    FROM coaches c
    JOIN users u ON u.id = c.id
    WHERE 1=1
  `;
  const params: unknown[] = [];

  if (category) { sql += " AND c.game_category = ?"; params.push(category); }
  if (q) { sql += " AND (u.nickname LIKE ? OR c.game_category LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }

  sql += " ORDER BY c.avg_rating DESC LIMIT ? OFFSET ?";
  params.push(limit, offset);

  const coaches = await d1.prepare(sql).bind(...params).all();
  return NextResponse.json({ coaches: coaches.results, total: coaches.results.length });
}
