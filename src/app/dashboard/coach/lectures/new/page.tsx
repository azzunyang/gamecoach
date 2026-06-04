"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import Icon from "@/components/Icon";

const GAMES = [
  { game:"Valorant",          cat:"fps"    },
  { game:"CS2",               cat:"fps"    },
  { game:"League of Legends", cat:"moba"   },
  { game:"Dota 2",            cat:"moba"   },
  { game:"TFT",               cat:"strat"  },
  { game:"StarCraft 2",       cat:"strat"  },
  { game:"Overwatch 2",       cat:"team"   },
  { game:"PUBG",              cat:"br"     },
  { game:"Brawl Stars",       cat:"casual" },
];

const LEVELS = ["전체", "입문", "초급", "중급", "고급"];
const DURATIONS = [30, 45, 60, 90, 120];

export default function NewLecturePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [target, setTarget] = useState("");
  const [curriculum, setCurriculum] = useState([
    { step: "", desc: "" },
    { step: "", desc: "" },
    { step: "", desc: "" },
  ]);
  const [game, setGame] = useState("");
  const [price, setPrice] = useState("0.05");
  const [duration, setDuration] = useState(60);
  const [level, setLevel] = useState("전체");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedGame = GAMES.find((g) => g.game === game);

  const submit = async () => {
    if (!title.trim()) { setError("강의 제목을 입력해주세요"); return; }
    if (!game) { setError("게임을 선택해주세요"); return; }
    if (!price || parseFloat(price) <= 0) { setError("가격을 입력해주세요"); return; }

    setLoading(true); setError("");
    try {
      const filledCurriculum = curriculum.filter((c) => c.step.trim());
      const res = await fetch("/api/lectures", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          target: target.trim() || undefined,
          curriculum: filledCurriculum.length > 0 ? JSON.stringify(filledCurriculum) : undefined,
          game,
          game_category: selectedGame?.cat ?? "casual",
          price_eth: price,
          duration,
          level,
        }),
      });
      if (!res.ok) {
        const e = await res.json() as { error?: string };
        throw new Error(e.error ?? "등록 실패");
      }
      router.push("/dashboard/coach/lectures");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopNav />
      <main style={{ minHeight:"100dvh", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"calc(var(--nav-h) + 32px) 20px 60px" }}>
        <div className="card" style={{ width:"100%", maxWidth:560, padding:36 }}>
          <div style={{ marginBottom:28 }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => router.back()}
              style={{ marginBottom:16, display:"inline-flex" }}
            >
              <Icon name="chevL" size={14} />
              뒤로
            </button>
            <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>새 강의 등록</h1>
            <p style={{ fontSize:14, color:"var(--muted)" }}>수강생에게 보여질 강의 상품을 만들어 보세요</p>
          </div>

          <div className="col gap-18">
            {/* Title */}
            <div className="field">
              <label className="label">강의 제목 <span className="req">*</span></label>
              <input
                className="input"
                placeholder="예: LoL 정글 포지셔닝 집중 코칭"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
              <div className="hint" style={{ textAlign:"right" }}>{title.length}/50</div>
            </div>

            {/* Description */}
            <div className="field">
              <label className="label">강의 소개</label>
              <textarea
                className="textarea"
                placeholder="이 강의에서 무엇을 배울 수 있는지 설명해주세요"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={400}
                style={{ minHeight:90 }}
              />
              <div className="hint" style={{ textAlign:"right" }}>{description.length}/400</div>
            </div>

            {/* Target */}
            <div className="field">
              <label className="label">이런 분께 추천해요</label>
              <textarea
                className="textarea"
                placeholder={"한 줄씩 입력해주세요 (Enter로 구분)\n예: 에임이 부족한 분\n크로스헤어 배치가 불안정한 분"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                maxLength={300}
                style={{ minHeight:90 }}
              />
              <div className="hint">엔터(Enter)로 항목을 구분해주세요</div>
            </div>

            {/* Curriculum */}
            <div className="field">
              <label className="label">커리큘럼</label>
              <div className="col gap-10">
                {curriculum.map((item, i) => (
                  <div key={i} className="row gap-10" style={{ alignItems:'flex-start' }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:'var(--ink)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:900, flexShrink:0, marginTop:6 }}>
                      {i+1}
                    </div>
                    <div className="col gap-6" style={{ flex:1 }}>
                      <input
                        className="input"
                        placeholder={`단계 ${i+1} 제목 (예: 에임 루틴 점검)`}
                        value={item.step}
                        onChange={(e) => {
                          const next = [...curriculum];
                          next[i] = { ...next[i], step: e.target.value };
                          setCurriculum(next);
                        }}
                      />
                      <input
                        className="input"
                        placeholder="설명 (예: 현재 세팅 분석 및 최적 워밍업 루틴 설계)"
                        value={item.desc}
                        onChange={(e) => {
                          const next = [...curriculum];
                          next[i] = { ...next[i], desc: e.target.value };
                          setCurriculum(next);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                style={{ marginTop:8 }}
                onClick={() => setCurriculum([...curriculum, { step:"", desc:"" }])}
              >
                <Icon name="plus" size={13} />
                단계 추가
              </button>
            </div>

            {/* Game */}
            <div className="field">
              <label className="label">게임 <span className="req">*</span></label>
              <div className="row wrap gap-8">
                {GAMES.map((g) => (
                  <button
                    key={g.game}
                    className={`chip${game === g.game ? " on" : ""}`}
                    onClick={() => setGame(game === g.game ? "" : g.game)}
                  >
                    {g.game}
                  </button>
                ))}
              </div>
            </div>

            {/* Level */}
            <div className="field">
              <label className="label">대상 수준</label>
              <div className="row wrap gap-8">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    className={`chip${level === l ? " on" : ""}`}
                    onClick={() => setLevel(l)}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Price + Duration */}
            <div className="grid-2 gap-12">
              <div className="field">
                <label className="label">가격 (ETH) <span className="req">*</span></label>
                <input
                  className="input"
                  type="number"
                  step="0.005"
                  min="0.001"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">강의 시간</label>
                <select className="select" value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}분</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <div className="notice" style={{ background:"var(--danger-tint)", borderColor:"rgba(218,58,63,.2)", color:"var(--danger)" }}>
                <Icon name="warn" size={14} style={{ display:"inline", marginRight:6 }} />
                {error}
              </div>
            )}

            <div className="notice info">
              <Icon name="info" size={14} style={{ display:"inline", marginRight:6 }} />
              등록 후 강의 목록에서 공개/비공개를 설정할 수 있어요
            </div>

            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={submit}
              disabled={loading}
            >
              {loading ? <span className="spin dark" /> : <Icon name="check" size={18} />}
              강의 등록하기
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
