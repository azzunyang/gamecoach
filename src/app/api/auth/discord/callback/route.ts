import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getSession } from "@/lib/session";

export const runtime = "edge";

function db(): D1Database {
  try {
    return getRequestContext().env.DB as D1Database;
  } catch {
    return null as unknown as D1Database;
  }
}

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.redirect(new URL("/auth/register?discord=error", req.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID ?? "";
  const clientSecret = process.env.DISCORD_CLIENT_SECRET ?? "";
  const redirectUri = process.env.DISCORD_REDIRECT_URI ?? "";

  // Exchange code for access token
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/auth/register?discord=error", req.url));
  }

  const { access_token } = await tokenRes.json() as { access_token: string };

  // Fetch Discord user
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/auth/register?discord=error", req.url));
  }

  const discordUser = await userRes.json() as { id: string; username: string };

  // Link to current session user if logged in
  const session = await getSession(req);
  if (session) {
    const d1 = db();
    if (d1) {
      await d1.prepare(
        "UPDATE users SET discord_id = ?, discord_username = ? WHERE id = ?"
      ).bind(discordUser.id, discordUser.username, session.userId).run();
    }
    return NextResponse.redirect(new URL("/dashboard/" + session.role + "?discord=linked", req.url));
  }

  return NextResponse.redirect(new URL("/auth/register?discord=linked&did=" + discordUser.id, req.url));
}
