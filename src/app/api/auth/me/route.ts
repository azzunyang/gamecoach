import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json(null, { status: 401 });
  }
  return NextResponse.json({
    id: session.userId,
    address: session.wallet ?? "",
    role: session.role,
    nickname: session.nickname,
  });
}
