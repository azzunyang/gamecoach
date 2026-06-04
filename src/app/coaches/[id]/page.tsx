"use client";
export const runtime = "edge";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";
import BookingModal from "@/components/BookingModal";
import LectureThumbnail from "@/components/LectureThumbnail";

const GAME_GRAD: Record<string, [string, string]> = {
  'Valorant':          ['#2A1216','#5A1E27'],
  'CS2':               ['#15202B','#2C3E50'],
  'League of Legends': ['#0E1726','#1E3A5F'],
  'Dota 2':            ['#1A1410','#3A2417'],
  'TFT':               ['#1B1430','#3A2A5C'],
  'Overwatch 2':       ['#1E1409','#52340C'],
  'PUBG':              ['#161616','#3A3A2A'],
  'Brawl Stars':       ['#1A0E22','#43215C'],
  'StarCraft 2':       ['#0D1117','#1C3A5C'],
};

const CATEGORY_GLYPH: Record<string, string> = {
  fps:'◎', moba:'✦', strat:'▣', team:'❖', br:'◈', casual:'○',
};

const GAME_TO_CATEGORY: Record<string, string> = {
  'Valorant':'fps', 'CS2':'fps',
  'League of Legends':'moba', 'Dota 2':'moba',
  'TFT':'strat', 'StarCraft 2':'strat',
  'Overwatch 2':'team',
  'PUBG':'br',
  'Brawl Stars':'casual',
};

interface DBCoach {
  id: string;
  nickname: string;
  game_category: string;
  tier: string;
  tier_self: number;
  price_eth: string;
  session_min: number;
  intro?: string;
  curriculum?: string;
  style?: string;
  is_published: number;
  avg_rating: number;
  review_count: number;
  wallet?: string;
}

interface DBReview {
  id: string;
  student_nickname: string;
  score_explain: number;
  score_comm: number;
  score_time: number;
  score_curr: number;
  body?: string;
  created_at: number;
}

interface Lecture {
  id: string;
  title: string;
  description?: string;
  game: string;
  price_eth: string;
  duration: number;
  level: string;
  is_published: number;
}

const CAT_GAME: Record<string, string> = {
  fps:'Valorant', moba:'League of Legends', strat:'TFT',
  team:'Overwatch 2', br:'PUBG', casual:'Brawl Stars',
};

type MockCoachEntry = DBCoach & { game: string; mockReviews: DBReview[] };

const MOCK_COACHES_DB: Record<string, MockCoachEntry> = {
  dragonking: {
    id:'dragonking', nickname:'DragonKing', game_category:'moba', game:'League of Legends',
    tier:'챌린저', tier_self:0, price_eth:'0.05', session_min:60,
    intro:'챌린저 정글러로 3시즌 유지. 정글 동선과 오브젝트 설계를 중심으로 게임을 읽는 눈을 키워드립니다.',
    curriculum:JSON.stringify([
      { t:'정글 기초 동선', d:'초반 3분 동선 최적화 및 갱킹 타이밍', m:20 },
      { t:'오브젝트 판단', d:'드래곤·바론 교환 타이밍과 우선순위', m:20 },
      { t:'갱킹 루트', d:'라인별 진입 각도와 합류 신호 읽기', m:20 },
    ]),
    is_published:1, avg_rating:4.9, review_count:127,
    mockReviews:[
      { id:'r1', student_nickname:'별빛수호자', score_explain:5, score_comm:5, score_time:5, score_curr:5, body:'정글 동선을 이렇게 체계적으로 설명해주는 코치는 처음이에요. 수업 하나로 티어가 바로 올랐습니다!', created_at:1748000000 },
      { id:'r2', student_nickname:'MidLane99',  score_explain:5, score_comm:4, score_time:5, score_curr:5, body:'오브젝트 타이밍 감각을 완전히 바꿔준 수업. 드래곤 교환 판단이 훨씬 명확해졌어요.', created_at:1747000000 },
      { id:'r3', student_nickname:'Jungle_K',   score_explain:4, score_comm:5, score_time:4, score_curr:5, body:'갱킹 루트 분석이 정말 유익했어요. 다음에도 꼭 신청할게요.', created_at:1746000000 },
    ],
  },
  shadowace: {
    id:'shadowace', nickname:'ShadowAce', game_category:'fps', game:'Valorant',
    tier:'다이아 2', tier_self:0, price_eth:'0.04', session_min:60,
    intro:'다이아 2 타격대 메인. 에임 루틴과 유틸 타이밍으로 라운드 주도권을 잡는 법을 가르칩니다.',
    curriculum:JSON.stringify([
      { t:'에임 루틴', d:'매일 10분 워밍업 루틴 구성 및 크로스헤어 배치', m:20 },
      { t:'엔트리 동선', d:'사이트 진입 각도와 피킹 타이밍', m:20 },
      { t:'유틸 타이밍', d:'플래시·스모크 실전 활용법', m:20 },
    ]),
    is_published:1, avg_rating:4.8, review_count:89,
    mockReviews:[
      { id:'r4', student_nickname:'QuickScope_K', score_explain:5, score_comm:5, score_time:5, score_curr:4, body:'에임 루틴 하나만으로 K/D가 확 올랐어요. 매일 따라하고 있습니다. 진짜 추천!', created_at:1748100000 },
      { id:'r5', student_nickname:'SilentShot',   score_explain:4, score_comm:5, score_time:5, score_curr:5, body:'엔트리 각도 교정 후 팀원들이 차이를 느끼더라고요. 핵심만 콕 집어주세요.', created_at:1747200000 },
      { id:'r6', student_nickname:'ValorantFan',  score_explain:5, score_comm:4, score_time:4, score_curr:5, body:'유틸 타이밍이 약점이었는데 이번 수업으로 확실히 잡았습니다.', created_at:1746300000 },
    ],
  },
  frostqueen: {
    id:'frostqueen', nickname:'FrostQueen', game_category:'team', game:'Overwatch 2',
    tier:'그랜드마스터', tier_self:0, price_eth:'0.045', session_min:60,
    intro:'그랜드마스터 서포터. 힐러 포지셔닝과 궁극기 운용으로 팀파이트를 설계합니다.',
    curriculum:JSON.stringify([
      { t:'포지셔닝 기초', d:'힐러 안전 구역과 시야 관리', m:20 },
      { t:'궁극기 운용', d:'궁극기 충전·교환 타이밍 판단', m:20 },
      { t:'팀파이트 설계', d:'이니시에이팅 콜 & 회피 루트', m:20 },
    ]),
    is_published:1, avg_rating:4.95, review_count:64,
    mockReviews:[
      { id:'r7', student_nickname:'HealBot_J',  score_explain:5, score_comm:5, score_time:5, score_curr:5, body:'서포터 포지셔닝이 이런 거였구나 싶었어요. 팀원들도 "서포트가 달라졌다"고 하더라고요.', created_at:1748200000 },
      { id:'r8', student_nickname:'AnaMain_77', score_explain:5, score_comm:4, score_time:5, score_curr:5, body:'궁극기 타이밍 교정이 핵심이었어요. 팀파이트 승률이 눈에 띄게 올랐습니다.', created_at:1747500000 },
      { id:'r9', student_nickname:'LifeWeaver', score_explain:4, score_comm:5, score_time:5, score_curr:4, body:'힐러를 처음 배우는데 이 수업 하나로 기초가 탄탄해졌어요. 완강 추천!', created_at:1746800000 },
    ],
  },
  tigerstrat: {
    id:'tigerstrat', nickname:'tig3r_strat', game_category:'strat', game:'TFT',
    tier:'마스터', tier_self:0, price_eth:'0.035', session_min:60,
    intro:'마스터 TFT 플레이어. 메타 덱 분석과 경제 운용으로 빠른 티어 상승을 돕습니다.',
    curriculum:JSON.stringify([
      { t:'경제 사이클', d:'롤링 타이밍과 이자 최적화', m:20 },
      { t:'메타 덱 파악', d:'현재 패치 S·A티어 덱 구성', m:20 },
      { t:'포지셔닝', d:'챔피언 배치와 카운터 셋업', m:20 },
    ]),
    is_published:1, avg_rating:4.7, review_count:41,
    mockReviews:[
      { id:'r10', student_nickname:'TFT_Master', score_explain:5, score_comm:4, score_time:5, score_curr:4, body:'경제 운용을 제대로 배우고 나니 상위권 안착이 훨씬 쉬워졌어요.', created_at:1748000000 },
      { id:'r11', student_nickname:'DeckBuilder', score_explain:4, score_comm:5, score_time:4, score_curr:5, body:'메타 덱 설명이 정말 이해하기 쉬웠어요. 패치마다 적용할 수 있는 기준을 배웠습니다.', created_at:1747100000 },
    ],
  },
  voidpubg: {
    id:'voidpubg', nickname:'VoidWalker', game_category:'br', game:'PUBG',
    tier:'다이아', tier_self:0, price_eth:'0.04', session_min:90,
    intro:'다이아 IGL. 자기장 운영과 교전 판단으로 생존율과 파이널 순위를 올려드립니다.',
    curriculum:JSON.stringify([
      { t:'자기장 예측', d:'자기장 이동 타이밍과 포지션', m:30 },
      { t:'교전 판단', d:'언제 싸우고 언제 피할지 기준 세우기', m:30 },
      { t:'최종 서클', d:'파이널 서클 포지셔닝과 클리어', m:30 },
    ]),
    is_published:1, avg_rating:4.6, review_count:33,
    mockReviews:[
      { id:'r12', student_nickname:'CircleKing', score_explain:4, score_comm:4, score_time:5, score_curr:4, body:'자기장 타이밍 감각을 완전히 바꿔줬어요. 파이널 진입률이 크게 늘었습니다.', created_at:1748000000 },
    ],
  },
  csgodemon: {
    id:'csgodemon', nickname:'demon.cs', game_category:'fps', game:'CS2',
    tier:'글로벌 엘리트', tier_self:0, price_eth:'0.05', session_min:60,
    intro:'글로벌 엘리트 AWP 스페셜리스트. 포지셔닝과 원샷 타이밍을 집중적으로 교정합니다.',
    curriculum:JSON.stringify([
      { t:'AWP 포지셔닝', d:'사이트별 주요 포지션과 도망 루트', m:20 },
      { t:'픽 타이밍', d:'정보 기반 픽킹과 리픽 판단', m:20 },
      { t:'경제 운용', d:'AWP 경제와 팀 구매 사이클', m:20 },
    ]),
    is_published:1, avg_rating:4.85, review_count:52,
    mockReviews:[
      { id:'r13', student_nickname:'SniperElite', score_explain:5, score_comm:5, score_time:5, score_curr:5, body:'AWP 포지션을 이렇게 체계적으로 배운 적이 없었어요. 레이팅이 확 올랐습니다.', created_at:1748000000 },
      { id:'r14', student_nickname:'CS_Veteran',  score_explain:5, score_comm:4, score_time:5, score_curr:4, body:'픽 타이밍 교정이 특히 도움이 됐어요. 팀원들 반응도 좋아졌습니다.', created_at:1747200000 },
    ],
  },
};

export default function CoachDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [coach, setCoach] = useState<DBCoach | null>(null);
  const [reviews, setReviews] = useState<DBReview[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [lectureFavs, setLectureFavs] = useState<Set<string>>(new Set());
  const [coachFav, setCoachFav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/coaches/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const data = d as { coach?: DBCoach; reviews?: DBReview[] } | null;
        if (data?.coach) {
          setCoach(data.coach);
          setReviews(data.reviews?.length ? data.reviews : (MOCK_COACHES_DB[id]?.mockReviews ?? []));
        } else if (MOCK_COACHES_DB[id]) {
          const m = MOCK_COACHES_DB[id];
          setCoach(m);
          setReviews(m.mockReviews);
        }
      })
      .catch(() => {
        if (MOCK_COACHES_DB[id]) {
          const m = MOCK_COACHES_DB[id];
          setCoach(m);
          setReviews(m.mockReviews);
        }
      })
      .finally(() => setLoading(false));

    // 강의 목록
    fetch(`/api/lectures?coach_id=${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const data = d as { lectures?: Lecture[] } | null;
        if (data?.lectures) setLectures(data.lectures);
      })
      .catch(() => {});

    // 로그인 + 강의 찜 목록
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d && (d as { id?: string }).id) {
          setIsLoggedIn(true);
          return fetch("/api/wishlist/lectures");
        }
        return null;
      })
      .then((r) => r?.ok ? r.json() : null)
      .then((d) => {
        const data = d as { lectures?: { id: string }[] } | null;
        if (data?.lectures) setLectureFavs(new Set(data.lectures.map((l) => l.id)));
      })
      .catch(() => {});
  }, [id]);

  const toggleLectureFav = async (lectureId: string) => {
    if (!isLoggedIn) return;
    const isFav = lectureFavs.has(lectureId);
    await fetch("/api/wishlist/lectures", {
      method: isFav ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lecture_id: lectureId }),
    });
    setLectureFavs((prev) => {
      const next = new Set(prev);
      if (isFav) next.delete(lectureId); else next.add(lectureId);
      return next;
    });
  };

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span className="spin" />
        </main>
      </>
    );
  }

  if (!coach) {
    return (
      <>
        <TopNav />
        <main className="page">
          <Link href="/coaches" className="btn btn-ghost btn-sm" style={{ marginBottom:20, display:'inline-flex' }}>
            <Icon name="chevL" size={14} />목록으로
          </Link>
          <div className="card card-pad" style={{ textAlign:'center', padding:'60px 20px' }}>
            <Icon name="warn" size={36} style={{ margin:'0 auto 12px', display:'block', color:'var(--muted)' }} />
            <div style={{ fontWeight:700, marginBottom:8 }}>코치를 찾을 수 없어요</div>
            <Link href="/coaches" className="btn btn-outline btn-sm" style={{ display:'inline-flex', marginTop:8 }}>코치 목록으로</Link>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const gameName = CAT_GAME[coach.game_category] ?? coach.game_category;
  const g = GAME_GRAD[gameName] ?? ['#1a1a2e','#16213e'];
  const glyph = CATEGORY_GLYPH[coach.game_category] ?? '○';
  const avgScore = reviews.length > 0
    ? ((reviews.reduce((s, r) => s + r.score_explain + r.score_comm + r.score_time + r.score_curr, 0) / reviews.length / 4)).toFixed(1)
    : coach.avg_rating.toFixed(1);

  let curriculum: { t: string; d: string; m: number }[] = [];
  try { curriculum = JSON.parse(coach.curriculum ?? "[]"); } catch { curriculum = []; }

  return (
    <>
      <TopNav />
      <main className="page">
        <Link href="/coaches" className="btn btn-ghost btn-sm" style={{ marginBottom:20, display:'inline-flex' }}>
          <Icon name="chevL" size={14} />
          목록으로
        </Link>

        {/* Hero */}
        <div className="card" style={{ overflow:'hidden', marginBottom:24 }}>
          <div style={{ height:220, position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${g[0]},${g[1]})` }} />
            <div style={{ position:'absolute', inset:0, opacity:.035, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            <div style={{ position:'absolute', right:20, bottom:16, opacity:.15, color:'#fff', fontSize:100, lineHeight:1, fontWeight:800 }}>{glyph}</div>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 24px', background:'linear-gradient(transparent,rgba(0,0,0,.6))' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:'.06em' }}>{gameName}</div>
            </div>
          </div>
          <div style={{ padding:'20px 24px', display:'flex', alignItems:'flex-start', gap:16 }}>
            <Avatar name={coach.nickname} idx={0} size={56} />
            <div style={{ flex:1 }}>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>{coach.nickname}</h1>
              <div className="row gap-6 wrap" style={{ marginBottom:8 }}>
                <span className="badge b-tier">{coach.tier || '티어 미설정'}</span>
                <span className="badge b-game">{coach.game_category.toUpperCase()}</span>
                {coach.tier_self === 0 && <span className="badge b-verify"><Icon name="shieldChk" size={10} />인증</span>}
              </div>
              {coach.intro && <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.5 }}>{coach.intro}</p>}
            </div>
            <div className="row gap-6">
              <Icon name="star" size={14} fill style={{ color:'#F5A623' }} />
              <span style={{ fontWeight:800 }}>{avgScore}</span>
              <span style={{ color:'var(--muted)', fontSize:13 }}>({coach.review_count})</span>
            </div>
          </div>
        </div>

        <div className="detail-grid">
          {/* Left */}
          <div className="col gap-20">
            {/* Intro */}
            {coach.intro && (
              <div className="card card-pad">
                <h2 className="h3" style={{ marginBottom:12 }}>코치 소개</h2>
                <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.7 }}>{coach.intro}</p>
              </div>
            )}

            {/* Lectures */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:16 }}>
                진행 중인 강의
                <span style={{ fontSize:14, color:'var(--muted)', fontWeight:500, marginLeft:8 }}>({lectures.length}개)</span>
              </h2>
              {lectures.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px', color:'var(--muted)', fontSize:14 }}>
                  <Icon name="book" size={28} style={{ margin:'0 auto 8px', display:'block' }} />
                  등록된 강의가 없어요
                </div>
              ) : (
                <div className="col gap-0">
                  <div className="col gap-12">
                    {lectures.map((lec) => (
                      <div key={lec.id} className="card hover-lift" style={{ overflow:'hidden', borderRadius:'var(--r)' }}>
                        <Link href={`/lectures/${lec.id}`} style={{ textDecoration:'none', display:'block' }}>
                          <LectureThumbnail
                            game={lec.game}
                            title={lec.title}
                            coachName={coach.nickname}
                            level={lec.level}
                            price={lec.price_eth}
                            duration={lec.duration}
                            height={150}
                          />
                        </Link>
                        <div style={{ padding:'10px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div className="row gap-8">
                            <span className="badge b-game" style={{ fontSize:11 }}>{lec.game}</span>
                            <span className="badge" style={{ fontSize:11 }}>{lec.level}</span>
                            <span style={{ fontSize:12, color:'var(--muted)' }}>{lec.duration}분</span>
                          </div>
                          <button
                            onClick={() => toggleLectureFav(lec.id)}
                            className="btn btn-outline btn-xs"
                            style={{
                              color: lectureFavs.has(lec.id) ? 'var(--danger)' : undefined,
                              borderColor: lectureFavs.has(lec.id) ? 'var(--danger)' : undefined,
                            }}
                          >
                            <Icon name="heart" size={12} fill={lectureFavs.has(lec.id)} />
                            {lectureFavs.has(lec.id) ? '찜 해제' : '강의 찜'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <div className="card card-pad">
                <h2 className="h3" style={{ marginBottom:16 }}>수업 커리큘럼</h2>
                <div className="col gap-0">
                  {curriculum.map((item, i) => (
                    <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start', padding:'14px 0', borderBottom: i < curriculum.length-1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'var(--muted)', flexShrink:0 }}>{i+1}</div>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{item.t}</div>
                        <div style={{ fontSize:13, color:'var(--muted)' }}>{item.d}</div>
                      </div>
                      <span style={{ fontSize:12, color:'var(--muted)', whiteSpace:'nowrap', marginTop:4 }}>{item.m}분</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <div className="card card-pad">
                <h2 className="h3" style={{ marginBottom:16 }}>
                  수강생 리뷰
                  <span style={{ fontSize:14, color:'var(--muted)', fontWeight:500, marginLeft:8 }}>({reviews.length}건)</span>
                </h2>
                <div className="col gap-0">
                  {reviews.map((r, i) => {
                    const avg = ((r.score_explain + r.score_comm + r.score_time + r.score_curr) / 4);
                    return (
                      <div key={r.id} style={{ padding:'16px 0', borderBottom: i < reviews.length-1 ? '1px solid var(--line)' : 'none' }}>
                        <div className="row gap-8" style={{ marginBottom:8 }}>
                          <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>👤</div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700 }}>{r.student_nickname || '익명의 수강생'}</div>
                            <div className="row gap-2">
                              {Array.from({length:5}).map((_,j)=>(
                                <Icon key={j} name="star" size={11} fill style={{ color: j < Math.round(avg) ? '#F5A623' : 'var(--line-strong)' }} />
                              ))}
                            </div>
                          </div>
                        </div>
                        {r.body && <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.6 }}>{r.body}</p>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {coach.tier_self === 1 && (
              <div className="notice warn row gap-8">
                <Icon name="warn" size={15} style={{ flexShrink:0 }} />
                <span>이 코치의 티어는 자기 신고 정보입니다. 수업 전 확인을 권장합니다.</span>
              </div>
            )}
            <div style={{ textAlign:'center' }}>
              <button className="btn btn-ghost btn-sm" style={{ color:'var(--muted)', fontSize:12 }}>
                <Icon name="flag" size={13} />
                이 코치 신고하기
              </button>
            </div>
          </div>

          {/* Right: booking box */}
          <div className="detail-side">
            <div className="book-box col gap-16">
              <div>
                <div className="row gap-6" style={{ marginBottom:4 }}>
                  <Icon name="star" size={14} fill style={{ color:'#F5A623' }} />
                  <span style={{ fontWeight:700 }}>{avgScore}</span>
                  <span style={{ color:'var(--muted)', fontSize:13 }}>수강후기 {coach.review_count}건</span>
                </div>
                <div>
                  <span className="eth-amt" style={{ fontSize:24, fontWeight:900 }}>{coach.price_eth} ETH</span>
                  <span style={{ fontSize:13, color:'var(--muted)', marginLeft:6 }}>/ {coach.session_min}분 세션</span>
                </div>
              </div>

              <button
                className="btn btn-accent btn-lg btn-block"
                onClick={() => setShowBooking(true)}
              >
                <Icon name="calendar" size={16} />
                수업 신청하기
              </button>

              <button
                className="btn btn-outline btn-block"
                onClick={() => setCoachFav(!coachFav)}
                style={{ color: coachFav ? 'var(--danger)' : undefined, borderColor: coachFav ? 'var(--danger)' : undefined }}
              >
                <Icon name="heart" size={16} fill={coachFav} />
                {coachFav ? '코치 찜 해제' : '코치 찜하기'}
              </button>

              <div className="divider" style={{ margin:0 }} />

              <div className="col gap-10">
                {[
                  { icon:'book', label:'누적 수업', val:`${coach.review_count}건` },
                  { icon:'star', label:'평균 별점', val:avgScore },
                  { icon:'clock', label:'세션 시간', val:`${coach.session_min}분` },
                ].map((row) => (
                  <div key={row.label} className="row gap-10">
                    <Icon name={row.icon as "clock"} size={15} style={{ color:'var(--muted)', flexShrink:0 }} />
                    <span style={{ fontSize:13, color:'var(--muted)', flex:1 }}>{row.label}</span>
                    <span style={{ fontSize:13, fontWeight:600 }}>{row.val}</span>
                  </div>
                ))}
              </div>

              <div className="notice">
                <Icon name="lock" size={12} style={{ display:'inline', marginRight:5 }} />
                예약금은 에스크로에 잠기며, 수업 완료 후 코치에게 전달됩니다.
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />

      {showBooking && (
        <BookingModal
          coach={{
            id: coach.id,
            name: coach.nickname,
            game: gameName,
            session: coach.session_min,
            price: parseFloat(coach.price_eth),
            avi: 0,
          }}
          onClose={() => setShowBooking(false)}
          onBooked={() => setShowBooking(false)}
        />
      )}
    </>
  );
}
