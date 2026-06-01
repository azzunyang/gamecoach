"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import Icon from "@/components/Icon";

const GAME_CATEGORIES = [
  { id:'fps', name:'FPS' },
  { id:'moba', name:'MOBA' },
  { id:'strat', name:'전략' },
  { id:'team', name:'팀파이트' },
  { id:'br', name:'배틀로얄' },
  { id:'casual', name:'캐주얼' },
];

interface Me { id: string; role: "student" | "coach" | null; nickname?: string }

export default function ProfileSetupPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [nickname, setNickname] = useState("");
  const [intro, setIntro] = useState("");
  const [category, setCategory] = useState("");
  const [tier, setTier] = useState("");
  const [price, setPrice] = useState("0.05");
  const [sessionMin, setSessionMin] = useState("60");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const d = data as Me | null;
        if (!d?.id) router.push("/auth/login");
        else setMe(d);
      })
      .catch(() => router.push("/auth/login"));
  }, [router]);

  const submit = async () => {
    if (!nickname.trim()) { setError("닉네임을 입력해주세요"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname, intro,
          game_category: category,
          tier,
          price_eth: price,
          session_min: Number(sessionMin),
        }),
      });
      if (!res.ok) throw new Error("저장 실패");
      router.push("/");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (!me) {
    return (
      <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <span className="spin" />
      </div>
    );
  }

  const isCoach = me.role === "coach";

  return (
    <>
      <TopNav />
      <main style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'calc(var(--nav-h) + 24px) 20px 60px' }}>
        <div className="card" style={{ width:'100%', maxWidth:520, padding:36 }}>

          <div style={{ textAlign:'center', marginBottom:32 }}>
            <div style={{ display:'inline-flex', width:56, height:56, borderRadius:16, background: isCoach ? 'var(--warn-tint)' : 'var(--discord-tint)', alignItems:'center', justifyContent:'center', marginBottom:12, color: isCoach ? 'var(--warn)' : 'var(--discord)' }}>
              <Icon name={isCoach ? "trophy" : "book"} size={26} />
            </div>
            <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>
              {isCoach ? "코치 프로필 설정" : "프로필 설정"}
            </h1>
            <p style={{ fontSize:14, color:'var(--muted)' }}>
              {isCoach
                ? "수강생에게 보여질 코치 프로필을 작성해 주세요"
                : "GameCoach에서 사용할 프로필을 설정해 주세요"}
            </p>
          </div>

          <div className="col gap-18">
            {/* Nickname */}
            <div className="field">
              <label className="label">닉네임 <span className="req">*</span></label>
              <input
                className="input"
                placeholder={isCoach ? "코치 활동명을 입력하세요" : "사용할 닉네임을 입력하세요"}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
              />
            </div>

            {isCoach && (
              <>
                {/* Intro */}
                <div className="field">
                  <label className="label">자기소개</label>
                  <textarea
                    className="textarea"
                    placeholder="코칭 스타일, 경력, 전문 분야를 간략히 소개해 주세요"
                    value={intro}
                    onChange={(e) => setIntro(e.target.value)}
                    maxLength={300}
                    style={{ minHeight:100 }}
                  />
                  <div className="hint" style={{ textAlign:'right' }}>{intro.length}/300</div>
                </div>

                {/* Game category chips */}
                <div className="field">
                  <label className="label">주요 게임 카테고리</label>
                  <div className="row wrap gap-8">
                    {GAME_CATEGORIES.map((c) => (
                      <button
                        key={c.id}
                        className={`chip${category === c.id ? ' on' : ''}`}
                        onClick={() => setCategory(category === c.id ? '' : c.id)}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tier */}
                <div className="field">
                  <label className="label">현재 티어</label>
                  <input
                    className="input"
                    placeholder="예: 챌린저, 레디언트, 그랜드마스터"
                    value={tier}
                    onChange={(e) => setTier(e.target.value)}
                  />
                  <div className="hint">
                    <Icon name="warn" size={12} style={{ display:'inline', marginRight:4, color:'var(--warn)' }} />
                    자기신고 티어는 미검증으로 표시됩니다
                  </div>
                </div>

                {/* Price + Session */}
                <div className="grid-2 gap-12">
                  <div className="field">
                    <label className="label">세션 가격 (ETH)</label>
                    <input
                      className="input"
                      type="number"
                      step="0.005"
                      min="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label className="label">세션 시간</label>
                    <select
                      className="select"
                      value={sessionMin}
                      onChange={(e) => setSessionMin(e.target.value)}
                    >
                      <option value="30">30분</option>
                      <option value="45">45분</option>
                      <option value="60">60분</option>
                      <option value="90">90분</option>
                      <option value="120">120분</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {!isCoach && (
              <div className="notice info">
                <Icon name="info" size={14} style={{ display:'inline', marginRight:6 }} />
                닉네임 설정 후 코치를 찾아 수업을 신청해 보세요.
                Discord 연동 등 추가 설정은 나중에 할 수 있어요.
              </div>
            )}

            {error && (
              <div className="notice" style={{ background:'var(--danger-tint)', borderColor:'rgba(218,58,63,.2)', color:'var(--danger)' }}>
                <Icon name="warn" size={14} style={{ display:'inline', marginRight:6 }} />
                {error}
              </div>
            )}

            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={submit}
              disabled={loading}
            >
              {loading ? <span className="spin dark" /> : <Icon name="check" size={18} />}
              프로필 저장하고 시작하기
            </button>
            <button
              className="btn btn-ghost btn-block"
              onClick={() => router.push("/")}
            >
              나중에 설정하기
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
