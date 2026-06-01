"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

const MOCK_REQUESTS = [
  { id:'l1', student:'GamerX99', sAvi:4, game:'League of Legends', tier:'골드', slot:'2026-06-09 18:00', msg:'정글 갱킹 타이밍을 잡는 법을 배우고 싶어요.' },
  { id:'l2', student:'AimTrainer', sAvi:6, game:'Valorant', tier:'플래티넘', slot:'2026-06-11 14:00', msg:'크로스헤어 배치와 피킹 각도를 교정받고 싶습니다.' },
  { id:'l3', student:'TopLaner99', sAvi:1, game:'League of Legends', tier:'다이아', slot:'2026-06-13 10:00', msg:'라인전 CS와 포지셔닝 집중 코칭 부탁드립니다.' },
];

const MOCK_UPCOMING = [
  { id:'u1', student:'SilverHope', sAvi:0, game:'League of Legends', slot:'2026-06-06 20:00', session:60 },
  { id:'u2', student:'ValorantPro', sAvi:3, game:'Valorant', slot:'2026-06-07 16:00', session:60 },
];

interface Me { id: string; address: string; role: string; nickname?: string }

function CoachDashboardContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") ?? "dashboard";
  const [tab, setTab] = useState(tabParam);
  const [profileOpen, setProfileOpen] = useState(false);
  const [requests, setRequests] = useState(MOCK_REQUESTS);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { const m = d as Me | null; if (m?.id) setMe(m); })
      .catch(() => {});
    fetch("/api/lessons")
      .then((r) => r.ok ? r.json() : null)
      .catch(() => {});
  }, []);

  const acceptReq = (id: string) => setRequests((p) => p.filter((r) => r.id !== id));
  const rejectReq = (id: string) => setRequests((p) => p.filter((r) => r.id !== id));

  return (
    <>
      <TopNav />
      <main className="page">
        {/* Header */}
        <div className="spread" style={{ marginBottom:28 }}>
          <div className="row gap-14">
            <Avatar name={me?.nickname || "코치"} idx={2} size={52} online />
            <div>
              <div className="row gap-8" style={{ marginBottom:4 }}>
                <span style={{ fontWeight:900, fontSize:20 }}>{me?.nickname || "코치"}</span>
                <span className="badge" style={{ background:'var(--sunken)', color:'var(--ink-soft)', fontSize:11 }}>코치</span>
              </div>
              <div style={{ fontSize:13, color:'var(--muted)', fontFamily:'var(--mono)' }}>
                {me?.address ? `${me.address.slice(0,6)}…${me.address.slice(-4)}` : '지갑 연결됨'}
              </div>
            </div>
          </div>
          <div className="row gap-10">
            <Link href={`/coaches/${me?.id ?? ''}`} className="btn btn-outline btn-sm">
              <Icon name="user" size={14} />
              내 공개 프로필
            </Link>
            <button className="btn btn-accent btn-sm">
              <Icon name="eth" size={14} />
              ETH 인출
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid-4 gap-16" style={{ marginBottom:32 }}>
          {[
            { icon:'eth', cls:'accent', label:'인출 가능', val:'0.34 ETH' },
            { icon:'lock', cls:'warn', label:'에스크로 잠금', val:'0.12 ETH' },
            { icon:'coin', cls:'green', label:'누적 수익', val:'3.87 ETH' },
            { icon:'star', cls:'', label:'평균 별점', val:'4.9' },
          ].map((s) => (
            <div key={s.label} className="card card-pad row gap-12">
              <div className={`dash-ic${s.cls ? ' '+s.cls : ''}`}>
                <Icon name={s.icon as "eth"} size={20} />
              </div>
              <div>
                <div className="eth-amt" style={{ fontSize:20, fontWeight:900 }}>{s.val}</div>
                <div style={{ fontSize:12, color:'var(--muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="row gap-2" style={{ marginBottom:24, borderBottom:'1px solid var(--line)', paddingBottom:0 }}>
          {[
            { id:'dashboard', label:'대시보드' },
            { id:'requests', label:`요청 ${requests.length > 0 ? `(${requests.length})` : ''}` },
            { id:'earnings', label:'수익' },
            { id:'profile', label:'프로필 설정' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:'10px 16px', background:'none', border:'none', cursor:'pointer',
                fontWeight: tab===t.id ? 700 : 500, fontSize:14,
                color: tab===t.id ? 'var(--ink)' : 'var(--muted)',
                borderBottom: tab===t.id ? '2px solid var(--ink)' : '2px solid transparent',
                marginBottom:-1,
                fontFamily:'var(--sans)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard tab */}
        {tab === 'dashboard' && (
          <div className="grid-2 gap-20">
            {/* Pending requests */}
            <div>
              <h2 className="h3" style={{ marginBottom:16 }}>
                신규 수업 요청
                {requests.length > 0 && (
                  <span style={{ marginLeft:8, background:'var(--danger)', color:'#fff', borderRadius:'var(--pill)', padding:'2px 8px', fontSize:12, fontWeight:700 }}>
                    {requests.length}
                  </span>
                )}
              </h2>
              {requests.length === 0 ? (
                <div className="card card-pad" style={{ textAlign:'center', color:'var(--muted)', padding:'40px 20px' }}>
                  <Icon name="check" size={28} style={{ margin:'0 auto 12px', display:'block', color:'var(--success)' }} />
                  <div style={{ fontWeight:700 }}>모든 요청을 처리했어요</div>
                </div>
              ) : (
                <div className="col gap-14">
                  {requests.map((req) => (
                    <div key={req.id} className="card card-pad">
                      <div className="row gap-10" style={{ marginBottom:12 }}>
                        <Avatar name={req.student} idx={req.sAvi} size={36} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700 }}>{req.student}</div>
                          <div style={{ fontSize:12, color:'var(--muted)' }}>{req.game} · {req.tier}</div>
                        </div>
                        <div style={{ fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>{req.slot}</div>
                      </div>
                      {req.msg && (
                        <div className="req-msg" style={{ marginBottom:12 }}>{req.msg}</div>
                      )}
                      <div className="row gap-8">
                        <button className="btn btn-danger btn-sm" onClick={() => rejectReq(req.id)}>거절</button>
                        <button className="btn btn-accent btn-sm" onClick={() => acceptReq(req.id)}>
                          <Icon name="check" size={13} />
                          수락
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming sessions */}
            <div>
              <h2 className="h3" style={{ marginBottom:16 }}>예정된 수업</h2>
              {MOCK_UPCOMING.length === 0 ? (
                <div className="card card-pad" style={{ textAlign:'center', color:'var(--muted)', padding:'40px 20px' }}>
                  <div style={{ fontWeight:700 }}>예정된 수업이 없어요</div>
                </div>
              ) : (
                <div className="col gap-14">
                  {MOCK_UPCOMING.map((u) => (
                    <div key={u.id} className="card card-pad">
                      <div className="row gap-10" style={{ marginBottom:12 }}>
                        <div style={{ width:44, height:44, borderRadius:'var(--r-sm)', background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'var(--ink-soft)', flexShrink:0 }}>
                          {u.slot.split('-')[2].split(' ')[0]}
                          <br/>
                          <span style={{ fontSize:10, fontWeight:600, color:'var(--muted)' }}>6월</span>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700 }}>{u.student}</div>
                          <div style={{ fontSize:12, color:'var(--muted)' }}>{u.game} · {u.slot.split(' ')[1]} · {u.session}분</div>
                        </div>
                      </div>
                      <div className="row gap-8">
                        <Link href={`/chat/${u.id}`} className="btn btn-outline btn-sm">
                          <Icon name="chat" size={13} />
                          채팅
                        </Link>
                        <button className="btn btn-accent btn-sm">수업 시작</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Requests tab */}
        {tab === 'requests' && (
          <div className="col gap-14">
            <h2 className="h3" style={{ marginBottom:8 }}>수업 요청 목록</h2>
            {requests.map((req) => (
              <div key={req.id} className="card card-pad">
                <div className="row gap-10" style={{ marginBottom:12 }}>
                  <Avatar name={req.student} idx={req.sAvi} size={40} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700 }}>{req.student}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>{req.game} · {req.tier} · {req.slot}</div>
                  </div>
                </div>
                {req.msg && <div className="req-msg" style={{ marginBottom:12 }}>{req.msg}</div>}
                <div className="row gap-8">
                  <button className="btn btn-danger btn-sm" onClick={() => rejectReq(req.id)}>거절</button>
                  <button className="btn btn-accent btn-sm" onClick={() => acceptReq(req.id)}>
                    <Icon name="check" size={13} />
                    수락
                  </button>
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="card card-pad" style={{ textAlign:'center', color:'var(--muted)', padding:'60px 20px' }}>
                대기 중인 요청이 없습니다.
              </div>
            )}
          </div>
        )}

        {/* Earnings tab */}
        {tab === 'earnings' && (
          <div className="col gap-20">
            <h2 className="h3">수익 현황</h2>
            <div className="grid-3 gap-16">
              {[
                { label:'이번달 수익', val:'0.34 ETH' },
                { label:'지난달 수익', val:'0.51 ETH' },
                { label:'전체 누적', val:'3.87 ETH' },
              ].map((s) => (
                <div key={s.label} className="card card-pad">
                  <div className="eth-amt" style={{ fontSize:24, fontWeight:900 }}>{s.val}</div>
                  <div style={{ fontSize:12, color:'var(--muted)', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div className="card card-pad">
              <div className="spread" style={{ marginBottom:16 }}>
                <h3 className="h3">최근 정산 내역</h3>
              </div>
              <div className="col gap-0">
                {MOCK_UPCOMING.map((u, i) => (
                  <div key={u.id} style={{ padding:'14px 0', borderBottom: i<MOCK_UPCOMING.length-1 ? '1px solid var(--line)' : 'none' }} className="spread">
                    <div>
                      <div style={{ fontWeight:600 }}>{u.student}</div>
                      <div style={{ fontSize:12, color:'var(--muted)' }}>{u.slot} · {u.game}</div>
                    </div>
                    <span className="eth-amt" style={{ color:'var(--success)', fontWeight:700 }}>+0.04 ETH</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card card-pad" style={{ maxWidth:560 }}>
            <h2 className="h3" style={{ marginBottom:20 }}>프로필 편집</h2>
            <div className="col gap-16">
              <div className="field">
                <label className="label">자기소개</label>
                <textarea className="textarea" defaultValue="챌린저 정글러 출신. 라인 갱킹 타이밍, 시야 장악, 한타 진입 각까지 — 왜 이렇게 움직여야 하는지를 이해시키는 코칭을 지향합니다." />
              </div>
              <div className="grid-2 gap-12">
                <div className="field">
                  <label className="label">세션 가격 (ETH)</label>
                  <input className="input" type="number" step="0.005" defaultValue="0.05" />
                </div>
                <div className="field">
                  <label className="label">세션 시간</label>
                  <select className="select" defaultValue="60">
                    <option value="30">30분</option>
                    <option value="45">45분</option>
                    <option value="60">60분</option>
                    <option value="90">90분</option>
                  </select>
                </div>
              </div>
              <div className="spread">
                <label className="label">프로필 공개</label>
                <button className="toggle on" onClick={() => setProfileOpen(!profileOpen)} />
              </div>
              <button className="btn btn-primary btn-lg">저장</button>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}

export default function CoachDashboardPage() {
  return (
    <Suspense fallback={<div className="page">로딩중...</div>}>
      <CoachDashboardContent />
    </Suspense>
  );
}
