"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const defaultRole = params.get("role") as "coach" | "student" | null;

  const [role, setRole] = useState<"coach" | "student">(defaultRole ?? "student");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");
    try {
      setStep("connecting");
      if (!window.ethereum) throw new Error("MetaMask가 설치되어 있지 않습니다.");
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" }) as unknown as string[];
      const addr = accounts[0];
      if (!addr) throw new Error("지갑 계정을 찾을 수 없습니다. MetaMask에서 계정을 선택해주세요.");

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
        body: JSON.stringify({ address: addr, signature, role }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "가입 실패");

      setStep("done");
      router.push("/profile/setup");
    } catch (e) {
      setError((e as Error).message);
      setStep("idle");
    }
  };

  const isLoading = step === "connecting" || step === "signing";
  const btnLabel =
    step === "connecting" ? "지갑 연결 중..." :
    step === "signing" ? "MetaMask에서 서명해주세요..." :
    "MetaMask로 가입하기";

  const roles = [
    {
      id: "student" as const,
      title: "배우고 싶어요",
      sub: "게임 실력을 키우고 싶은 학생",
      icon: "book",
      color: "var(--discord)",
      bg: "var(--discord-tint)",
    },
    {
      id: "coach" as const,
      title: "가르치고 싶어요",
      sub: "실력을 가르치고 수익을 창출하는 코치",
      icon: "trophy",
      color: "var(--warn)",
      bg: "var(--warn-tint)",
    },
  ];

  return (
    <>
      <TopNav />
      <main style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'calc(var(--nav-h) + 24px) 20px 60px' }}>
        <div className="card" style={{ width:'100%', maxWidth:460, padding:36 }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ display:'inline-flex', width:52, height:52, borderRadius:14, background:'var(--ink)', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontSize:24, fontWeight:900, marginBottom:10 }}>G</div>
            <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>GameCoach 시작하기</h1>
            <p style={{ fontSize:14, color:'var(--muted)' }}>역할을 선택하고 MetaMask로 가입하세요</p>
          </div>

          {/* Role selection */}
          <div className="col gap-12" style={{ marginBottom:28 }}>
            <div className="label">어떤 역할로 시작하시나요?</div>
            <div className="grid-2 gap-12">
              {roles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className="role-card"
                  style={{
                    borderColor: role === r.id ? 'var(--ink)' : undefined,
                    background: role === r.id ? 'var(--sunken)' : undefined,
                    textAlign:'left',
                  }}
                >
                  <div className="role-ic" style={{ background: r.bg, color: r.color }}>
                    <Icon name={r.icon as "book"} size={24} />
                  </div>
                  <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{r.title}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', lineHeight:1.4 }}>{r.sub}</div>
                  {role === r.id && (
                    <div style={{ position:'absolute', top:12, right:12 }}>
                      <Icon name="check" size={16} style={{ color:'var(--success)' }} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <button
            className={`btn btn-lg btn-block${isLoading ? '' : ' btn-primary'}`}
            onClick={handleRegister}
            disabled={isLoading}
            style={{
              background: isLoading ? 'var(--sunken)' : undefined,
              color: isLoading ? 'var(--muted)' : undefined,
              marginBottom:16,
            }}
          >
            {isLoading ? (
              <>
                <span className="spin" style={{ borderTopColor:'var(--ink)' }} />
                {btnLabel}
              </>
            ) : (
              <>
                <span style={{ fontSize:18 }}>🦊</span>
                {btnLabel}
              </>
            )}
          </button>

          {error && (
            <div className="notice" style={{ background:'var(--danger-tint)', borderColor:'rgba(218,58,63,.2)', color:'var(--danger)', marginBottom:16 }}>
              <Icon name="warn" size={14} style={{ display:'inline', marginRight:6 }} />
              {error}
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
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/login" style={{ color:'var(--ink)', fontWeight:700 }}>로그인</Link>
          </p>
        </div>
      </main>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterForm />
    </Suspense>
  );
}
