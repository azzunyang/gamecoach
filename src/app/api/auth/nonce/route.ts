import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { devKv } from "@/lib/devKv";

export const runtime = "edge";

function kv(): KVNamespace {
  try {
    return getRequestContext().env.KV as KVNamespace;
  } catch {
    return devKv;
  }
}

export async function GET(req: NextRequest) {
  try {
    const address = req.nextUrl.searchParams.get("address")?.toLowerCase();
    if (!address || !/^0x[0-9a-f]{40}$/.test(address)) {
      return NextResponse.json({ error: "유효하지 않은 지갑 주소" }, { status: 400 });
    }
    const nonce = crypto.randomUUID();
    await kv().put(`nonce:${address}`, nonce, { expirationTtl: 300 });
    return NextResponse.json({ nonce });
  } catch (e) {
    console.error("nonce error:", e);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
