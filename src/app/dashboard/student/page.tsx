"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

interface Lesson {
  id: string;
  coach: string;
  coachAvi: number;
  game: string;
  slot: string;
  session: number;
  state: string;
  price: number;
}

const MOCK_LESSONS: Lesson[] = [
  { id:'l1', coach:'DragonKing', coachAvi:2, game:'League of Legends', slot:'2026-06-09 18:00', session:60, state:'PENDING', price:0.05 },
  { id:'l2', coach:'ShadowAce', coachAvi:0, game:'Valorant', slot:'2026-06-11 14:00', session:60, state:'ACCEPTED', price:0.04 },
  { id:'l3', coach:'FrostQueen', coachAvi:5, game:'Overwatch 2', slot:'2026-05-20 19:00', session:60, state:'COMPLETED', price:0.045 },
];

const MOCK_FAVES = [
  { id:'dragonking', name:'DragonKing', avi:2, game:'League of Legends', tier:'챌린저', price:0.05, rating:4.9 },
  { id:'frostqueen', name:'FrostQueen', avi:5, game:'Overwatch 2', tier:'그랜드마스터', price:0.045, rating:4.95 },
];

const STATE_MAP: Record<string, { label:string; cls:string }> = {
  PENDING:   { label:'승인 대기', cls:'st-pending' },
  ACCEPTED:  { label:'수락됨',   cls:'st-accepted' },
  ACTIVE:    { label:'진행중',   cls:'st-progress' },
  COMPLETED: { label:'완료',     cls:'st-done' },
  REJECTED:  { label:'거절됨',   cls:'st-rejected' },
};

interface Me { id: string; nickname?: string }

export default function StudentDashboard() {
  const [lessons, setLessons] = useState<Lesson[]>(MOCK_LESSONS);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { const m = d as Me | null; if (m?.id) setMe(m); })
      .catch(() => {});
    fetch("/api/lessons")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { const d = data as { lessons?: Lesson[] } | null; if (d?.lessons) setLessons(d.lessons); })
      .catch(() => {});
  }, []);

  const active = lessons.filter((l) => ['PENDING','ACCEPTED','ACTIVE'].includes(l.state));
  const done = lessons.filter((l) => l.state === 'COMPLETED');

  const totalSpend = lessons
    .filter((l) => l.state === 'COMPLETED')
    .reduce((sum, l) => sum + l.price, 0)
    .toFixed(3);

  return (
    <>
      <TopNav />
      <main className="page">
        {/* Greeting */}
        <div className="spread" style={{ marginBottom:28 }}>
          <div>
            <p className="eyebrow" style={{ marginBottom:4 }}>나의 대시보드</p>
            <h1 className="h2">안녕하세요{me?.nickname ? `, ${me.nickname}님` : ''} 👋</h1>
          </div>
          <Link href="/coaches" className="btn btn-accent">
            <Icon name="compass" size={16} />
            새 수업 찾기
          </Link>
        </div>

        {/* Stats */}
        <div className="grid-3 gap-16" style={{ marginBottom:32 }}>
          {[
            { icon:'clock', cls:'', label:'진행중 수업', val:String(active.length) },
            { icon:'check', cls:'green', label:'완료 수업', val:String(done.length) },
            { icon:'eth', cls:'accent', label:'총 지출', val:`${totalSpend} ETH` },
          ].map((s) => (
            <div key={s.label} className="card card-pad row gap-14">
              <div className={`dash-ic${s.cls ? ' '+s.cls : ''}`}>
                <Icon name={s.icon as "clock"} size={20} />
              </div>
              <div>
                <div style={{ fontSize:22, fontWeight:900, fontFamily:'var(--mono)' }}>{s.val}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Active lessons */}
        <div style={{ marginBottom:32 }}>
          <h2 className="h3" style={{ marginBottom:16 }}>진행 중인 수업</h2>
          {active.length === 0 ? (
            <div className="card card-pad" style={{ textAlign:'center', color:'var(--muted)', padding:'40px 20px' }}>
              <Icon name="calendar" size={32} style={{ margin:'0 auto 12px', display:'block' }} />
              <div style={{ fontWeight:700, marginBottom:6 }}>진행 중인 수업이 없어요</div>
              <Link href="/coaches" className="btn btn-accent btn-sm" style={{ display:'inline-flex', marginTop:8 }}>코치 찾기</Link>
            </div>
          ) : (
            <div className="card" style={{ overflow:'hidden' }}>
              {active.map((l, i) => {
                const st = STATE_MAP[l.state] ?? { label:l.state, cls:'' };
                return (
                  <div key={l.id} style={{ padding:'16px 20px', borderBottom: i<active.length-1 ? '1px solid var(--line)' : 'none' }}>
                    <div className="row gap-12">
                      <Avatar name={l.coach} idx={l.coachAvi} size={40} />
                      <div style={{ flex:1 }}>
                        <div className="row gap-8" style={{ marginBottom:4 }}>
                          <span style={{ fontWeight:700 }}>{l.coach} 코치</span>
                          <span className={`status ${st.cls}`}>{st.label}</span>
                        </div>
                        <div style={{ fontSize:12, color:'var(--muted)' }}>
                          {l.game} · {l.slot} · {l.session}분
                        </div>
                      </div>
                      <div style={{ textAlign:'right' }}>
                        <div className="eth-amt" style={{ fontSize:14 }}>{l.price} ETH</div>
                        {l.state === 'ACCEPTED' && (
                          <Link href={`/chat/${l.id}`} className="btn btn-outline btn-xs" style={{ marginTop:4 }}>채팅</Link>
                        )}
                      </div>
                      <Icon name="chevR" size={16} style={{ color:'var(--faint)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Faves */}
        <div>
          <h2 className="h3" style={{ marginBottom:16 }}>찜한 코치</h2>
          <div className="grid-2 gap-16">
            {MOCK_FAVES.map((c) => (
              <Link key={c.id} href={`/coaches/${c.id}`} className="card card-pad hover-lift" style={{ display:'flex', gap:14, alignItems:'center', textDecoration:'none' }}>
                <Avatar name={c.name} idx={c.avi} size={44} />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:800, marginBottom:4 }}>{c.name}</div>
                  <div className="row gap-6">
                    <span className="badge b-tier">{c.tier}</span>
                  </div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div className="eth-amt" style={{ fontSize:14, fontWeight:800 }}>{c.price} ETH</div>
                  <div className="row gap-4" style={{ justifyContent:'flex-end', marginTop:2 }}>
                    <Icon name="star" size={12} fill style={{ color:'#F5A623' }} />
                    <span style={{ fontSize:12 }}>{c.rating}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Review prompts */}
        {done.length > 0 && (
          <div style={{ marginTop:32 }}>
            <h2 className="h3" style={{ marginBottom:16 }}>리뷰 작성</h2>
            <div className="col gap-10">
              {done.map((l) => (
                <div key={l.id} className="card card-pad spread">
                  <div className="row gap-12">
                    <Avatar name={l.coach} idx={l.coachAvi} size={36} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>{l.coach} 코치</div>
                      <div style={{ fontSize:12, color:'var(--muted)' }}>{l.slot} · {l.game}</div>
                    </div>
                  </div>
                  <Link href={`/review/${l.id}`} className="btn btn-outline btn-sm">리뷰 쓰기</Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
