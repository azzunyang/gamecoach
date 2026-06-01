"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import Icon from "@/components/Icon";

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<string>;
    };
  }
}

type Step = "idle" | "connecting" | "signing" | "done";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("idle");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    setError("");
    try {
      setStep("connecting");
      if (!window.ethereum) throw new Error("MetaMask가 설치되어 있지 않습니다.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as unknown as string[];
      const addr = accounts[0];
      if (!addr) throw new Error("지갑 계정을 찾을 수 없습니다. MetaMask에서 계정을 선택해주세요.");
      setAddress(addr);

      const nonceRes = await fetch(`/api/auth/nonce?address=${addr}`);
      const { nonce, error: nonceErr } = await nonceRes.json() as { nonce?: string; error?: string };
      if (!nonce) throw new Error(nonceErr ?? "nonce 발급 실패");

      setStep("signing");
      const message = `GameCoach 인증 요청\n\nnonce: ${nonce}`;
      const signature = await window.ethereum.request({
        method: "personal_sign",
        params: [message, addr],
      });

      const res = await fetch("/api/auth/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addr, signature }),
      });
      const data = await res.json() as { ok?: boolean; role?: string; error?: string };

      if (res.status === 404) {
        throw new Error("등록되지 않은 지갑입니다. 먼저 회원가입을 해주세요.");
      }
      if (!res.ok) throw new Error(data.error ?? "로그인 실패");

      setStep("done");
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
      setStep("idle");
    }
  };

  const isLoading = step === "connecting" || step === "signing";
  const stepLabel =
    step === "connecting" ? "지갑 연결 중..." :
    step === "signing" ? "MetaMask에서 서명해주세요..." :
    "MetaMask로 로그인";

  return (
    <>
      <TopNav />
      <main style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'calc(var(--nav-h) + 24px) 20px 60px' }}>
        <div className="card" style={{ width:'100%', maxWidth:400, padding:36 }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ display:'inline-flex', width:56, height:56, borderRadius:16, background:'var(--ink)', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:26, fontWeight:900, marginBottom:12 }}>G</div>
            <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>MetaMask로 로그인</h1>
            <p style={{ fontSize:14, color:'var(--muted)' }}>연결된 지갑 주소로 간편하게 로그인하세요</p>
          </div>

          {/* MetaMask wallet icon */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{
              display:'inline-flex', width:80, height:80, borderRadius:20,
              background:'var(--ink)',
              alignItems:'center', justifyContent:'center', fontSize:40,
            }}>
              🦊
            </div>
          </div>

          <button
            className={`btn btn-lg btn-block${isLoading ? '' : ' btn-primary'}`}
            onClick={handleLogin}
            disabled={isLoading}
            style={{
              background: isLoading ? 'var(--sunken)' : undefined,
              color: isLoading ? 'var(--muted)' : undefined,
              marginBottom: 16,
            }}
          >
            {isLoading ? (
              <>
                <span className="spin" style={{ borderTopColor:'var(--ink)' }} />
                {stepLabel}
              </>
            ) : (
              <>
                <Icon name="wallet" size={18} />
                {stepLabel}
              </>
            )}
          </button>

          {address && step !== "done" && (
            <p style={{ textAlign:'center', fontSize:12, color:'var(--muted)', marginBottom:12, fontFamily:'var(--mono)' }}>
              {address.slice(0,6)}…{address.slice(-4)}
            </p>
          )}

          {error && (
            <div className="notice" style={{ background:'var(--danger-tint)', borderColor:'rgba(218,58,63,.2)', color:'var(--danger)', marginBottom:16 }}>
              <Icon name="warn" size={14} style={{ display:'inline', marginRight:6 }} />
              {error}
              {error.includes("회원가입") && (
                <div style={{ marginTop:8 }}>
                  <Link href="/auth/register" style={{ color:'var(--danger)', fontWeight:700, textDecoration:'underline' }}>
                    회원가입 하러 가기 →
                  </Link>
                </div>
              )}
            </div>
          )}

          <div className="notice" style={{ marginBottom:20 }}>
            <Icon name="info" size={13} style={{ display:'inline', marginRight:6 }} />
            MetaMask가 없으신가요?{" "}
            <a href="https://metamask.io/download" target="_blank" rel="noreferrer" style={{ color:'var(--ink)', fontWeight:700, textDecoration:'underline' }}>
              metamask.io
            </a>
            에서 설치하세요
          </div>

          <div className="divider" />
          <p style={{ textAlign:'center', fontSize:13, color:'var(--muted)' }}>
            처음 방문이신가요?{" "}
            <Link href="/auth/register" style={{ color:'var(--ink)', fontWeight:700 }}>회원가입</Link>
          </p>
        </div>
      </main>
    </>
  );
}
