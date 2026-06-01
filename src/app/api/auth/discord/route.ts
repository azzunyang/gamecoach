import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? "";

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: "Discord OAuth가 설정되지 않았습니다" }, { status: 503 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify",
  });

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params}`);
}
