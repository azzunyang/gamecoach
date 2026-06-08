"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

interface LessonRow {
  id: string;
  student_id: string;
  student_nickname: string;
  coach_id: string;
  game_category: string;
  tier: string;
  state: string;
  deposit_eth: string;
  created_at: number;
  slot_id: string;
}

interface Me { id: string; address: string; role: string; nickname?: string }

interface Lecture {
  id: string; title: string; game: string; price_eth: string;
  duration: number; level: string; is_published: number;
}

function CoachDashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tab = searchParams.get("tab") ?? "dashboard";
  const [profileOpen, setProfileOpen] = useState(false);
  const [allLessons, setAllLessons] = useState<LessonRow[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);

  const loadLessons = () => {
    fetch("/api/lessons")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { const data = d as { lessons?: LessonRow[] } | null; if (data?.lessons) setAllLessons(data.lessons); })
      .catch(() => {});
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const m = d as Me | null;
        if (m?.id) {
          setMe(m);
          fetch(`/api/lectures?coach_id=${m.id}&is_mine=1`)
            .then((r) => r.ok ? r.json() : null)
            .then((ld) => { const data = ld as { lectures?: Lecture[] } | null; if (data?.lectures) setLectures(data.lectures); })
            .catch(() => {});
        }
      })
      .catch(() => {});
    loadLessons();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requests = allLessons.filter((l) => l.state === 'PENDING');
  const upcoming = allLessons.filter((l) => ['ACCEPTED', 'ACTIVE'].includes(l.state));

  const acceptReq = async (id: string) => {
    await fetch(`/api/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ACCEPTED" }),
    });
    loadLessons();
  };

  const rejectReq = async (id: string) => {
    await fetch(`/api/lessons/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "REJECTED" }),
    });
    loadLessons();
  };

  const togglePublish = async (lec: Lecture) => {
    await fetch(`/api/lectures/${lec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: lec.is_published ? 0 : 1 }),
    });
    setLectures((prev) => prev.map((l) => l.id === lec.id ? { ...l, is_published: lec.is_published ? 0 : 1 } : l));
  };

  const deleteLecture = async (id: string) => {
    if (!confirm("강의를 삭제하시겠습니까?")) return;
    await fetch(`/api/lectures/${id}`, { method: "DELETE" });
    setLectures((prev) => prev.filter((l) => l.id !== id));
  };

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
            { id:'lectures', label:'강의 관리' },
            { id:'earnings', label:'수익' },
            { id:'profile', label:'프로필 설정' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => router.push(t.id === 'dashboard' ? '/dashboard/coach' : `/dashboard/coach?tab=${t.id}`)}
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
                        <Avatar name={req.student_nickname || '수강생'} idx={0} size={36} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700 }}>{req.student_nickname || '수강생'}</div>
                          <div style={{ fontSize:12, color:'var(--muted)' }}>{req.game_category} · {new Date(req.created_at * 1000).toLocaleDateString('ko')}</div>
                        </div>
                        <div style={{ fontSize:12, color:'var(--muted)', whiteSpace:'nowrap' }}>{req.deposit_eth} ETH</div>
                      </div>
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
              <h2 className="h3" style={{ marginBottom:16 }}>수락된 수업</h2>
              {upcoming.length === 0 ? (
                <div className="card card-pad" style={{ textAlign:'center', color:'var(--muted)', padding:'40px 20px' }}>
                  <div style={{ fontWeight:700 }}>예정된 수업이 없어요</div>
                </div>
              ) : (
                <div className="col gap-14">
                  {upcoming.map((u) => (
                    <div key={u.id} className="card card-pad">
                      <div className="row gap-10" style={{ marginBottom:12 }}>
                        <Avatar name={u.student_nickname || '수강생'} idx={0} size={40} />
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700 }}>{u.student_nickname || '수강생'}</div>
                          <div style={{ fontSize:12, color:'var(--muted)' }}>
                            {u.game_category} · {new Date(u.created_at * 1000).toLocaleDateString('ko')}
                          </div>
                        </div>
                        <span className={`status${u.state === 'ACTIVE' ? ' st-progress' : ' st-accepted'}`}>
                          {u.state === 'ACTIVE' ? '진행중' : '수락됨'}
                        </span>
                      </div>
                      <div className="row gap-8">
                        <Link href={`/chat/${u.id}`} className="btn btn-outline btn-sm">
                          <Icon name="chat" size={13} />
                          채팅
                        </Link>
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
            {requests.length === 0 && (
              <div className="card card-pad" style={{ textAlign:'center', color:'var(--muted)', padding:'60px 20px' }}>
                대기 중인 요청이 없습니다.
              </div>
            )}
            {requests.map((req) => (
              <div key={req.id} className="card card-pad">
                <div className="row gap-10" style={{ marginBottom:12 }}>
                  <Avatar name={req.student_nickname || '수강생'} idx={0} size={40} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700 }}>{req.student_nickname || '수강생'}</div>
                    <div style={{ fontSize:12, color:'var(--muted)' }}>
                      {req.game_category} · {new Date(req.created_at * 1000).toLocaleDateString('ko')} · {req.deposit_eth} ETH
                    </div>
                  </div>
                </div>
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

        {/* Lectures tab */}
        {tab === 'lectures' && (
          <div className="col gap-14">
            <div className="spread">
              <h2 className="h3">강의 관리 <span style={{ fontSize:14, color:'var(--muted)', fontWeight:500 }}>{lectures.length}개</span></h2>
              <Link href="/dashboard/coach/lectures/new" className="btn btn-accent btn-sm">
                <Icon name="plus" size={14} />
                새 강의 등록
              </Link>
            </div>
            {lectures.length === 0 ? (
              <div className="card card-pad" style={{ textAlign:'center', padding:'40px 20px' }}>
                <Icon name="book" size={32} style={{ margin:'0 auto 12px', display:'block', color:'var(--muted)' }} />
                <div style={{ fontWeight:700, marginBottom:8 }}>등록된 강의가 없어요</div>
                <p style={{ color:'var(--muted)', fontSize:14, marginBottom:16 }}>강의를 등록하면 수강생이 찾을 수 있어요</p>
                <Link href="/dashboard/coach/lectures/new" className="btn btn-accent btn-sm" style={{ display:'inline-flex' }}>
                  <Icon name="plus" size={14} />
                  첫 강의 등록하기
                </Link>
              </div>
            ) : (
              <div className="col gap-10">
                {lectures.map((lec) => (
                  <div key={lec.id} className="card card-pad spread">
                    <div className="row gap-12">
                      <div style={{ width:42, height:42, borderRadius:'var(--r-sm)', background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <Icon name="book" size={20} style={{ color:'var(--muted)' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight:700, marginBottom:4 }}>{lec.title}</div>
                        <div className="row gap-8">
                          <span className="badge b-game" style={{ fontSize:11 }}>{lec.game}</span>
                          <span className="badge" style={{ fontSize:11 }}>{lec.level}</span>
                          <span style={{ fontSize:12, color:'var(--muted)' }}>{lec.duration}분</span>
                          <span className="eth-amt" style={{ fontSize:12 }}>{lec.price_eth} ETH</span>
                        </div>
                      </div>
                    </div>
                    <div className="row gap-8">
                      <button
                        className="btn btn-outline btn-xs"
                        onClick={() => togglePublish(lec)}
                        style={{ color: lec.is_published ? 'var(--success)' : 'var(--muted)' }}
                      >
                        <Icon name={lec.is_published ? 'check' : 'warn'} size={12} />
                        {lec.is_published ? '공개중' : '비공개'}
                      </button>
                      <button
                        className="btn btn-xs"
                        style={{ background:'var(--danger-tint)', color:'var(--danger)', border:'none' }}
                        onClick={() => deleteLecture(lec.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                ))}
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
                {allLessons.filter(l => l.state === 'COMPLETED').slice(0, 5).map((u, i, arr) => (
                  <div key={u.id} style={{ padding:'14px 0', borderBottom: i < arr.length-1 ? '1px solid var(--line)' : 'none' }} className="spread">
                    <div>
                      <div style={{ fontWeight:600 }}>{u.student_nickname || '수강생'}</div>
                      <div style={{ fontSize:12, color:'var(--muted)' }}>{new Date(u.created_at * 1000).toLocaleDateString('ko')} · {u.game_category}</div>
                    </div>
                    <span className="eth-amt" style={{ color:'var(--success)', fontWeight:700 }}>+{u.deposit_eth} ETH</span>
                  </div>
                ))}
                {allLessons.filter(l => l.state === 'COMPLETED').length === 0 && (
                  <div style={{ textAlign:'center', padding:'20px', color:'var(--muted)', fontSize:13 }}>완료된 수업이 없어요</div>
                )}
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
