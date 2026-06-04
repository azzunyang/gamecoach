"use client";
export const runtime = "edge";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";
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

interface LectureDetail {
  id: string;
  coach_id: string;
  title: string;
  description?: string;
  target?: string;
  curriculum?: string;
  game: string;
  game_category: string;
  price_eth: string;
  duration: number;
  level: string;
  is_published: number;
  coach_nickname: string;
  coach_tier: string;
  coach_avg_rating: number;
  coach_review_count: number;
  coach_intro?: string;
  created_at: number;
}

interface Review {
  id: string;
  student_nickname: string;
  score_explain: number;
  score_comm: number;
  score_time: number;
  score_curr: number;
  body?: string;
  created_at: number;
}

const LEVEL_COLOR: Record<string, string> = {
  '입문': '#22c55e', '초급': '#3b82f6', '중급': '#f59e0b', '고급': '#ef4444', '전체': '#8b5cf6',
};

const MOCK_REVIEWS: Review[] = [
  { id:'mr1', student_nickname:'별빛수호자', score_explain:5, score_comm:5, score_time:5, score_curr:5, body:'설명이 너무 명쾌했어요. 바로 실전에 적용했는데 효과가 바로 나타났습니다!', created_at:1748000000 },
  { id:'mr2', student_nickname:'GamerPro_K', score_explain:4, score_comm:5, score_time:5, score_curr:4, body:'친절하고 핵심만 짚어주는 수업이었어요. 다음에도 꼭 신청할게요.', created_at:1747000000 },
  { id:'mr3', student_nickname:'익명수강생', score_explain:5, score_comm:4, score_time:5, score_curr:5, body:'기대 이상이었습니다. 실력이 확실히 늘었어요. 강력 추천!', created_at:1746500000 },
];

type GeneratedContent = { description: string; target: string; curriculum: { step: string; desc: string }[] };

const GAME_TEMPLATES: Record<string, (title: string, level: string) => GeneratedContent> = {
  'Valorant': (title, level) => ({
    description: `이 강의는 발로란트에서 ${level} 구간의 핵심 약점을 빠르게 교정하는 데 집중합니다. ${title.includes('에임') ? '에임 루틴과 크로스헤어 배치부터 시작해 실전 교전에서 바로 써먹을 수 있는 기술을 가르칩니다.' : title.includes('포지셔닝') ? '맵별 안전 포지션과 각도 싸움을 체계적으로 분석해 드립니다.' : '실전 기반의 1:1 피드백으로 단기간 실력 향상을 목표로 합니다.'} 수업 전 최근 경기 VOD를 공유해 주시면 맞춤 분석이 가능합니다.`,
    target: `발로란트 ${level} 티어 상승을 목표로 하는 분\n에임 또는 포지셔닝에서 반복적으로 막히는 분\n유틸 타이밍과 사이트 공략이 어려운 분\n1:1 맞춤 피드백으로 빠르게 교정하고 싶은 분`,
    curriculum: [
      { step: '현재 실력 진단', desc: '최근 경기 데이터·VOD 분석, 핵심 개선 포인트 파악' },
      { step: title.includes('에임') ? '에임 루틴 교정' : title.includes('포지셔닝') ? '포지셔닝 교정' : '핵심 스킬 교정', desc: title.includes('에임') ? '크로스헤어 배치·에임 안정화·데스매치 루틴 구성' : title.includes('포지셔닝') ? '맵별 안전 각도·피킹 타이밍·사이트별 교전 기준' : '유틸 라인업·라운드 읽기·교전 판단 기준 설정' },
      { step: '실전 반복 훈련', desc: '커스텀 매치 또는 데스매치로 배운 내용 즉시 적용' },
      { step: '복기 & 로드맵', desc: '수업 핵심 요약 정리 및 자기 연습 루틴 설계' },
    ],
  }),
  'CS2': (title, level) => ({
    description: `이 강의는 CS2에서 ${level} 실력을 빠르게 올리기 위한 핵심 기술을 실전 중심으로 가르칩니다. ${title.includes('AWP') ? 'AWP 포지셔닝과 픽 타이밍을 집중적으로 다루며, 레이팅과 서바이벌을 동시에 올립니다.' : title.includes('유틸') ? '스모크·플래시·몰로토프 라인업과 팀 유틸 조율 방법을 배웁니다.' : '포지셔닝 교정과 경제 운용으로 라운드 승률을 높입니다.'} 수업 중 실시간 화면 공유로 즉각적인 피드백을 제공합니다.`,
    target: `CS2 ${level} 구간에서 정체를 느끼는 분\n${title.includes('AWP') ? 'AWP를 주 무기로 선택하고 싶은 분' : '유틸리티 사용이 서투른 분'}\n레이팅 점수를 빠르게 올리고 싶은 분\n포지셔닝 실수가 잦은 분`,
    curriculum: [
      { step: '기초 포지셔닝 점검', desc: '사이트별 주요 홀드·피킹 각도와 카운터 포지션' },
      { step: title.includes('AWP') ? 'AWP 픽 타이밍' : '유틸리티 라인업', desc: title.includes('AWP') ? 'AWP 안전 각도·리픽·도망 루트 판단 기준' : '스모크·플래시·HE 라인업과 팀 유틸 조율' },
      { step: '경제 사이클 이해', desc: '풀 바이·포스 바이·세이브 판단 기준과 팀 조율' },
      { step: '실전 라운드 복기', desc: '직접 플레이한 경기 영상 분석 및 개선 피드백' },
    ],
  }),
  'League of Legends': (title, level) => ({
    description: `이 강의는 리그 오브 레전드 ${level} 구간에서 빠른 티어 상승을 목표로 합니다. ${title.includes('정글') ? '정글 동선 최적화와 오브젝트 판단력을 기릅니다.' : title.includes('미드') ? '미드 라인전 주도권 장악과 로밍 타이밍을 집중적으로 다룹니다.' : '라인전부터 팀파이트까지 롤의 핵심 흐름을 체계적으로 가르칩니다.'} 실시간 코치가 화면을 보며 즉각 피드백합니다.`,
    target: `LoL ${level} 티어를 목표로 하는 분\n라인전에서 주도권을 잡지 못하는 분\n오브젝트 타이밍 판단이 어려운 분\n게임 흐름을 읽는 눈을 키우고 싶은 분`,
    curriculum: [
      { step: '라인전 기초 점검', desc: 'CS 파밍 리듬·트레이드 판단·백도어 기준 교정' },
      { step: title.includes('정글') ? '정글 동선 최적화' : title.includes('미드') ? '미드 로밍 타이밍' : '포지션별 핵심 기술', desc: title.includes('정글') ? '초반 3분 동선·갱킹 진입 각도·카정 기준' : title.includes('미드') ? '파워 스파이크·로밍 신호·사이드 압박 타이밍' : '챔피언 고유 강점과 매치업별 교전 기준' },
      { step: '오브젝트 운영', desc: '드래곤·바론 교환 우선순위와 팀 합류 타이밍' },
      { step: '팀파이트 & 복기', desc: '포지셔닝·딜 순서·합류 판단 및 경기 VOD 분석' },
    ],
  }),
  'TFT': (title, _level) => ({
    description: `이 강의는 TFT에서 빠른 티어 상승을 위한 경제 사이클과 메타 덱 이해를 중심으로 진행합니다. ${title.includes('메타') ? '패치별 S·A 티어 덱 구성과 전환 타이밍을 가르칩니다.' : '롤링 타이밍과 이자 최적화로 매판 안정적인 상위권 마무리를 목표로 합니다.'}`,
    target: `TFT 골드~플래티넘 탈출을 원하는 분\n경제 사이클이 헷갈리는 분\n메타 덱 파악이 어려운 분\n포지셔닝 실수가 잦은 분`,
    curriculum: [
      { step: '경제 기초', desc: '이자 최적화·롤링 타이밍·레벨업 사이클 이해' },
      { step: '메타 덱 분석', desc: '현재 패치 S·A 티어 덱 핵심 아이템과 구성 기준' },
      { step: '포지셔닝 심화', desc: '챔피언 배치·카운터 셋업·사이드 포지션 조정' },
      { step: '실전 리플레이 분석', desc: '직접 플레이한 판 복기 및 실수 교정' },
    ],
  }),
  'Overwatch 2': (_title, level) => ({
    description: `이 강의는 오버워치 2 ${level} 구간에서 팀 기여도를 극적으로 높이는 데 집중합니다. 힐러·탱커·딜러 역할에 맞는 포지셔닝과 궁극기 운용을 1:1로 교정합니다.`,
    target: `오버워치 2 ${level} 티어 상승을 원하는 분\n팀파이트에서 역할을 다하지 못하는 분\n궁극기 타이밍이 어려운 분\n포지셔닝 실수가 잦은 분`,
    curriculum: [
      { step: '역할 이해', desc: '담당 역할의 우선 목표와 시야 관리 기준' },
      { step: '포지셔닝 교정', desc: '안전 구역·접근 루트·회피 동선 설정' },
      { step: '궁극기 운용', desc: '충전 타이밍·교환 판단·콤보 연계 기준' },
      { step: '팀파이트 복기', desc: '실제 경기 영상 분석 및 포지션·결정 피드백' },
    ],
  }),
  'PUBG': (_title, level) => ({
    description: `이 강의는 PUBG ${level} 구간에서 생존율과 파이널 순위를 올리기 위한 자기장 운영과 교전 판단을 집중적으로 다룹니다.`,
    target: `PUBG ${level} 랭킹 상승을 목표로 하는 분\n자기장 타이밍을 자주 놓치는 분\n교전 판단이 불확실한 분\n파이널 서클 운영이 어려운 분`,
    curriculum: [
      { step: '자기장 예측', desc: '자기장 이동 타이밍과 선점 포지션 선택 기준' },
      { step: '교전 판단', desc: '유리한 교전 vs 회피 기준, 차량 & 엄폐물 활용' },
      { step: '중반 운영', desc: '루팅 우선순위와 제3지역 이동 경로 판단' },
      { step: '파이널 서클', desc: '최종 포지션 선점과 1:1·스쿼드 클리어 기준' },
    ],
  }),
};

function generateContent(game: string, title: string, level: string): GeneratedContent {
  const tpl = GAME_TEMPLATES[game];
  if (tpl) return tpl(title, level);
  return {
    description: `${title} 강의에서는 1:1 맞춤 코칭으로 실력 향상의 핵심을 집중적으로 다룹니다.`,
    target: `${level} 실력 향상을 원하는 분\n빠른 성장을 원하는 분`,
    curriculum: [
      { step: '현재 실력 진단', desc: '플레이 스타일 분석 및 개선 포인트 파악' },
      { step: '핵심 스킬 교정', desc: '약점 집중 교정 및 실전 적용 훈련' },
      { step: '복기 & 피드백', desc: '수업 내용 정리 및 자율 연습 루틴 설계' },
    ],
  };
}

export default function LectureDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [lecture, setLecture] = useState<LectureDetail | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFav, setIsFav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/lectures/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const data = d as { lecture?: LectureDetail; reviews?: Review[] } | null;
        if (data?.lecture) {
          setLecture(data.lecture);
          setReviews(data.reviews?.length ? data.reviews : MOCK_REVIEWS);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if ((d as { id?: string } | null)?.id) {
          setIsLoggedIn(true);
          return fetch("/api/wishlist/lectures");
        }
        return null;
      })
      .then((r) => r?.ok ? r.json() : null)
      .then((d) => {
        const data = d as { lectures?: { id: string }[] } | null;
        if (data?.lectures?.some((l) => l.id === id)) setIsFav(true);
      })
      .catch(() => {});
  }, [id]);

  const toggleFav = async () => {
    if (!isLoggedIn) { router.push("/auth/login"); return; }
    await fetch("/api/wishlist/lectures", {
      method: isFav ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lecture_id: id }),
    });
    setIsFav(!isFav);
  };

  if (loading) {
    return (
      <>
        <TopNav />
        <main className="page" style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'60vh' }}>
          <span className="spin" />
        </main>
      </>
    );
  }

  if (!lecture) {
    return (
      <>
        <TopNav />
        <main className="page">
          <div className="card card-pad" style={{ textAlign:'center', padding:'60px 20px' }}>
            <Icon name="warn" size={36} style={{ margin:'0 auto 12px', display:'block', color:'var(--muted)' }} />
            <div style={{ fontWeight:700, marginBottom:12 }}>강의를 찾을 수 없어요</div>
            <button className="btn btn-outline btn-sm" onClick={() => router.back()}>뒤로가기</button>
          </div>
        </main>
        <BottomNav />
      </>
    );
  }

  const g = GAME_GRAD[lecture.game] ?? ['#1a1a2e','#16213e'];
  const glyph = CATEGORY_GLYPH[lecture.game_category] ?? '○';
  const levelColor = LEVEL_COLOR[lecture.level] ?? 'var(--muted)';

  const generated = generateContent(lecture.game, lecture.title, lecture.level);

  let curriculum: { step: string; desc: string }[] = [];
  try { curriculum = JSON.parse(lecture.curriculum ?? "[]"); } catch { curriculum = []; }
  if (curriculum.length === 0) curriculum = generated.curriculum;

  const description = lecture.description?.trim() || generated.description;
  const target = lecture.target?.trim() || generated.target;

  const avgReview = reviews.length > 0
    ? (reviews.reduce((s, r) => s + (r.score_explain + r.score_comm + r.score_time + r.score_curr) / 4, 0) / reviews.length).toFixed(1)
    : lecture.coach_avg_rating.toFixed(1);

  return (
    <>
      <TopNav />
      <main className="page">
        <button className="btn btn-ghost btn-sm" onClick={() => router.back()} style={{ marginBottom:20, display:'inline-flex' }}>
          <Icon name="chevL" size={14} />
          뒤로
        </button>

        {/* Hero */}
        <div className="card" style={{ overflow:'hidden', marginBottom:24, borderRadius:'var(--r)' }}>
          <LectureThumbnail
            game={lecture.game}
            title={lecture.title}
            coachName={lecture.coach_nickname}
            level={lecture.level}
            price={lecture.price_eth}
            duration={lecture.duration}
          />
        </div>

        <div className="detail-grid">
          {/* Left */}
          <div className="col gap-20">
            {/* Description */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:12 }}>강의 소개</h2>
              <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.8 }}>{description}</p>
            </div>

            {/* Target */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:14 }}>
                <Icon name="users" size={18} style={{ display:'inline', marginRight:8, color:'var(--accent-ink)', verticalAlign:'middle' }} />
                이런 분께 추천해요
              </h2>
              <div className="col gap-10">
                {target.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="row gap-10">
                    <div style={{ width:22, height:22, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Icon name="check" size={12} style={{ color:'var(--accent-ink)' }} />
                    </div>
                    <span style={{ fontSize:14, color:'var(--ink-soft)' }}>{line}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Curriculum */}
            {curriculum.length > 0 && (
              <div className="card card-pad">
                <h2 className="h3" style={{ marginBottom:16 }}>커리큘럼</h2>
                <div className="col gap-0">
                  {curriculum.map((item, i) => (
                    <div key={i} style={{ display:'flex', gap:16, padding:'16px 0', borderBottom: i < curriculum.length-1 ? '1px solid var(--line)' : 'none' }}>
                      <div style={{ width:32, height:32, borderRadius:10, background:'var(--ink)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, flexShrink:0 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:14, marginBottom:4 }}>{item.step}</div>
                        <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.6 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:16 }}>
                수강 후기
                <span style={{ fontSize:14, color:'var(--muted)', fontWeight:500, marginLeft:8 }}>({reviews.length}건)</span>
              </h2>
              {reviews.length === 0 ? (
                <div style={{ textAlign:'center', padding:'28px', color:'var(--muted)' }}>
                  <Icon name="star" size={28} style={{ margin:'0 auto 8px', display:'block' }} />
                  <div style={{ fontSize:14 }}>아직 후기가 없어요</div>
                </div>
              ) : (
                <div className="col gap-0">
                  {reviews.map((r, i) => {
                    const avg = (r.score_explain + r.score_comm + r.score_time + r.score_curr) / 4;
                    return (
                      <div key={r.id} style={{ padding:'16px 0', borderBottom: i < reviews.length-1 ? '1px solid var(--line)' : 'none' }}>
                        <div className="row gap-10" style={{ marginBottom:8 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0 }}>👤</div>
                          <div>
                            <div style={{ fontWeight:700, fontSize:13 }}>{r.student_nickname || '익명의 수강생'}</div>
                            <div className="row gap-2" style={{ marginTop:2 }}>
                              {Array.from({length:5}).map((_,j) => (
                                <Icon key={j} name="star" size={11} fill style={{ color: j < Math.round(avg) ? '#F5A623' : 'var(--line-strong)' }} />
                              ))}
                              <span style={{ fontSize:11, color:'var(--muted)', marginLeft:4 }}>{avg.toFixed(1)}</span>
                            </div>
                          </div>
                          <div style={{ marginLeft:'auto', fontSize:12, color:'var(--muted)' }}>
                            {new Date(r.created_at * 1000).toLocaleDateString('ko')}
                          </div>
                        </div>
                        {r.body && <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.6, paddingLeft:44 }}>{r.body}</p>}
                        <div className="row gap-12" style={{ marginTop:10, paddingLeft:44 }}>
                          {[
                            { label:'설명', val:r.score_explain },
                            { label:'소통', val:r.score_comm },
                            { label:'시간', val:r.score_time },
                            { label:'커리큘럼', val:r.score_curr },
                          ].map((s) => (
                            <div key={s.label} style={{ fontSize:12 }}>
                              <span style={{ color:'var(--muted)' }}>{s.label} </span>
                              <span style={{ fontWeight:700 }}>{s.val}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: booking + coach card */}
          <div className="detail-side">
            <div className="book-box col gap-16">
              {/* Price */}
              <div>
                <div style={{ fontSize:12, color:'var(--muted)', marginBottom:4 }}>수강료</div>
                <div className="row gap-6" style={{ alignItems:'baseline' }}>
                  <span className="eth-amt" style={{ fontSize:28, fontWeight:900 }}>{lecture.price_eth}</span>
                  <span style={{ fontSize:16, color:'var(--muted)' }}>ETH</span>
                </div>
                <div style={{ fontSize:12, color:'var(--muted)', marginTop:2 }}>{lecture.duration}분 세션</div>
              </div>

              <Link href={`/coaches/${lecture.coach_id}`} className="btn btn-accent btn-lg btn-block">
                <Icon name="calendar" size={16} />
                수업 신청하기
              </Link>

              <button
                className="btn btn-outline btn-block"
                onClick={toggleFav}
                style={{ color: isFav ? 'var(--danger)' : undefined, borderColor: isFav ? 'var(--danger)' : undefined }}
              >
                <Icon name="heart" size={16} fill={isFav} />
                {isFav ? '찜 해제' : '강의 찜하기'}
              </button>

              <div className="divider" style={{ margin:0 }} />

              {/* Coach card */}
              <Link href={`/coaches/${lecture.coach_id}`} style={{ textDecoration:'none' }}>
                <div className="row gap-12" style={{ padding:'12px', borderRadius:'var(--r-sm)', background:'var(--sunken)' }}>
                  <Avatar name={lecture.coach_nickname} idx={0} size={44} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, fontSize:14, marginBottom:4 }}>{lecture.coach_nickname}</div>
                    <div className="row gap-6">
                      <span className="badge b-tier" style={{ fontSize:11 }}>{lecture.coach_tier}</span>
                    </div>
                    {lecture.coach_intro && (
                      <p style={{ fontSize:12, color:'var(--muted)', marginTop:6, lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                        {lecture.coach_intro}
                      </p>
                    )}
                  </div>
                </div>
              </Link>

              <div className="row gap-10" style={{ justifyContent:'space-between' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:800, fontSize:18, fontFamily:'var(--mono)' }}>{avgReview}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>평균 별점</div>
                </div>
                <div style={{ width:1, background:'var(--line)', alignSelf:'stretch' }} />
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:800, fontSize:18, fontFamily:'var(--mono)' }}>{lecture.coach_review_count}</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>수강 후기</div>
                </div>
                <div style={{ width:1, background:'var(--line)', alignSelf:'stretch' }} />
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:800, fontSize:18, fontFamily:'var(--mono)' }}>{lecture.duration}분</div>
                  <div style={{ fontSize:11, color:'var(--muted)' }}>세션 시간</div>
                </div>
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
    </>
  );
}
