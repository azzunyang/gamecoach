import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

const OTP_TTL = 180; // 3 minutes
const RATE_TTL = 60; // 1 request per minute per phone

function kv(): KVNamespace {
  try {
    return getRequestContext().env.KV as KVNamespace;
  } catch {
    return {
      get: async () => null,
      put: async () => undefined,
      delete: async () => undefined,
    } as unknown as KVNamespace;
  }
}

async function sendNcpSms(phone: string, code: string): Promise<void> {
  const accessKey = process.env.NCP_ACCESS_KEY ?? "";
  const secretKey = process.env.NCP_SECRET_KEY ?? "";
  const serviceId = process.env.NCP_SMS_SERVICE_ID ?? "";
  const from = process.env.NCP_SMS_FROM ?? "";

  if (!accessKey || !serviceId) {
    // Dev mode: log OTP to console instead of sending
    console.log(`[DEV OTP] ${phone} → ${code}`);
    return;
  }

  const timestamp = Date.now().toString();
  const method = "POST";
  const url = `/sms/v2/services/${serviceId}/messages`;

  const hmacKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const message = `${method} ${url}\n${timestamp}\n${accessKey}`;
  const sig = await crypto.subtle.sign("HMAC", hmacKey, new TextEncoder().encode(message));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig)));

  await fetch(`https://sens.apigw.ntruss.com${url}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ncp-apigw-timestamp": timestamp,
      "x-ncp-iam-access-key": accessKey,
      "x-ncp-apigw-signature-v2": signature,
    },
    body: JSON.stringify({
      type: "SMS",
      from,
      messages: [{ to: phone, content: `[GameCoach] 인증번호: ${code}` }],
    }),
  });
}

// 데모용 번호 — OTP 없이 즉시 인증 통과 (발표 시연용)
const DEMO_PHONES = new Set(["01000000000", "01011111111", "01022222222"]);

export async function POST(req: NextRequest) {
  const { phone } = await req.json() as { phone: string };

  if (!/^01[0-9]{8,9}$/.test(phone)) {
    return NextResponse.json({ error: "올바른 휴대폰 번호를 입력하세요" }, { status: 400 });
  }

  // 데모 모드: 특정 번호는 OTP 000000으로 고정
  if (DEMO_PHONES.has(phone)) {
    const ns = kv();
    await ns.put(`otp:${phone}`, "000000", { expirationTtl: OTP_TTL });
    return NextResponse.json({ ok: true, demo: true });
  }

  const ns = kv();
  const rateKey = `otp_rate:${phone}`;
  const rateLimited = await ns.get(rateKey);
  if (rateLimited) {
    return NextResponse.json({ error: "잠시 후 다시 시도하세요 (1분 대기)" }, { status: 429 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await Promise.all([
    ns.put(`otp:${phone}`, code, { expirationTtl: OTP_TTL }),
    ns.put(rateKey, "1", { expirationTtl: RATE_TTL }),
  ]);

  try {
    await sendNcpSms(phone, code);
  } catch (e) {
    console.error("SMS send failed", e);
    // Still return success — OTP is in KV; dev can read from console
  }

  return NextResponse.json({ ok: true });
}
