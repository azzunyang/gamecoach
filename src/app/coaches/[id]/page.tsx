"use client";
export const runtime = "edge";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";
import BookingModal from "@/components/BookingModal";

const GAME_GRAD: Record<string, [string, string]> = {
  'Valorant': ['#2A1216','#5A1E27'],
  'CS2': ['#15202B','#2C3E50'],
  'League of Legends': ['#0E1726','#1E3A5F'],
  'Dota 2': ['#1A1410','#3A2417'],
  'TFT': ['#1B1430','#3A2A5C'],
  'Overwatch 2': ['#1E1409','#52340C'],
  'PUBG': ['#161616','#3A3A2A'],
  'Brawl Stars': ['#1A0E22','#43215C'],
};

const CATEGORIES = [
  { id:'fps',    name:'FPS',     glyph:'◎', games:['Valorant','CS2'],             hue:8   },
  { id:'moba',   name:'MOBA',    glyph:'✦', games:['League of Legends','Dota 2'], hue:222 },
  { id:'strat',  name:'전략',    glyph:'▣', games:['TFT','StarCraft 2'],           hue:268 },
  { id:'team',   name:'팀파이트', glyph:'❖', games:['Overwatch 2'],                hue:28  },
  { id:'br',     name:'배틀로얄', glyph:'◈', games:['PUBG'],                       hue:158 },
  { id:'casual', name:'캐주얼',   glyph:'○', games:['Brawl Stars'],                hue:330 },
];

const COACHES = [
  { id:'dragonking', name:'DragonKing', game:'League of Legends', cat:'moba',
    tier:'챌린저', position:'정글', price:0.05, rating:4.9, reviews:127, lessons:214,
    verify:true, discord:true, online:true, avi:2,
    session:60, consult:'평일 저녁', slots:3, responseMin:12,
    tagline:'정글 동선·오브젝트 설계로 게임을 읽는 법을 가르칩니다.',
    bio:'챌린저 정글러 출신. 라인 갱킹 타이밍, 시야 장악, 한타 진입 각까지 — "왜 이렇게 움직여야 하는지"를 이해시키는 코칭을 지향합니다. 5년차, 누적 200건 이상.',
    curriculum:[
      {t:'현재 실력 진단', d:'최근 게임 리플레이를 함께 보며 약점 파악', m:10},
      {t:'핵심 스킬 실습', d:'정글 동선·갱킹 타이밍·시야 장악 라이브 코칭', m:35},
      {t:'복습 & Q&A', d:'핵심 정리, 다음 목표 설정, 질문', m:15},
    ],
    career:['前 챌린저 정글 (시즌 12·13)','아마추어 대회 코치 2회 우승','누적 코칭 214건'],
    reviewList:[
      { by:'익명의 수강생', rating:5, tags:['설명이명확','친절','실력향상체감'], body:'정글 동선이 확실히 잡혔어요. 설명이 정말 명확하고 반복 연습까지 시켜줘서 좋았습니다.' },
      { by:'익명의 수강생', rating:5, tags:['시간준수','알찬구성'], body:'시간을 정말 알차게 씁니다. 갱킹 타이밍 감각이 많이 늘었어요.' },
    ],
  },
  { id:'shadowace', name:'ShadowAce', game:'Valorant', cat:'fps',
    tier:'다이아 2', position:'타격대', price:0.04, rating:4.8, reviews:89, lessons:142,
    verify:true, discord:true, online:false, avi:0,
    session:60, consult:'주말', slots:5, responseMin:30,
    tagline:'에임 루틴과 엔트리 동선으로 라운드 주도권을 잡으세요.',
    bio:'발로란트 타격대 메인. 크로스헤어 배치, 피킹 각, 유틸 연계까지 실전 위주로 코칭합니다.',
    curriculum:[
      {t:'에임·크로스헤어 점검', d:'세팅 최적화 + 워밍업 루틴', m:15},
      {t:'엔트리 & 피킹', d:'동선·각 보는 법 라이브 실습', m:30},
      {t:'리뷰 & 과제', d:'리플레이 분석 + 연습 과제', m:15},
    ],
    career:['다이아~불멸 구간 코칭 다수','누적 코칭 142건'],
    reviewList:[
      { by:'익명의 수강생', rating:5, tags:['에임향상','친절'], body:'에임이 정말 많이 늘었어요.' },
    ],
  },
  { id:'frostqueen', name:'FrostQueen', game:'Overwatch 2', cat:'team',
    tier:'그랜드마스터', position:'서포터', price:0.045, rating:4.95, reviews:64, lessons:98,
    verify:true, discord:true, online:true, avi:5,
    session:60, consult:'평일 저녁', slots:2, responseMin:8,
    tagline:'힐러 포지셔닝과 궁극기 운용으로 팀파이트를 설계합니다.',
    bio:'서포터 GM. 생존 포지셔닝, 궁 타이밍, 콜 위주의 코칭.',
    curriculum:[
      {t:'포지셔닝 진단', d:'데스 원인 분석 + 안전 라인 잡기', m:15},
      {t:'궁극기 & 콜', d:'타이밍·연계·콜 실습', m:30},
      {t:'정리 & 목표', d:'복습 + 랭크업 로드맵', m:15},
    ],
    career:['GM 서포터 다수 시즌','클랜 코치 활동','누적 코칭 98건'],
    reviewList:[
      { by:'익명의 수강생', rating:5, tags:['콜이정확','실력향상체감'], body:'궁 타이밍이 확실히 좋아졌어요.' },
    ],
  },
  { id:'tigerstrat', name:'tig3r_strat', game:'TFT', cat:'strat',
    tier:'마스터', position:'-', price:0.035, rating:4.7, reviews:41, lessons:57,
    verify:true, discord:true, online:false, avi:3,
    session:60, consult:'주말', slots:4, responseMin:45,
    tagline:'메타 덱 운영과 경제 관리로 안정적인 순방을 노립니다.',
    bio:'전략적 팀 전투 마스터. 덱 우선순위, 골드 관리, 포지셔닝까지 체계적 코칭.',
    curriculum:[
      {t:'메타 & 덱 이해', d:'현재 메타 티어덱 정리', m:15},
      {t:'라이브 운영', d:'실전 경제·레벨링·포지셔닝', m:30},
      {t:'복기', d:'순방 포인트 정리', m:15},
    ],
    career:['마스터 상위 % 유지','누적 코칭 57건'],
    reviewList:[],
  },
  { id:'voidpubg', name:'VoidWalker', game:'PUBG', cat:'br',
    tier:'다이아', position:'IGL', price:0.04, rating:4.6, reviews:33, lessons:48,
    verify:true, discord:true, online:true, avi:7,
    session:90, consult:'평일 저녁', slots:3, responseMin:20,
    tagline:'자기장 운영과 교전 판단으로 생존 확률을 끌어올립니다.',
    bio:'배그 IGL. 드랍·로테이션·교전 타이밍 콜.',
    curriculum:[
      {t:'드랍 & 초반', d:'안전 드랍·파밍 루트', m:20},
      {t:'로테이션 & 교전', d:'자기장 운영·교전 판단', m:45},
      {t:'정리', d:'팀 콜 복습', m:15},
    ],
    career:['스크림 코치','누적 코칭 48건'],
    reviewList:[],
  },
  { id:'csgodemon', name:'demon.cs', game:'CS2', cat:'fps',
    tier:'글로벌 엘리트', position:'AWP', price:0.05, rating:4.85, reviews:52, lessons:76,
    verify:true, discord:true, online:false, avi:1,
    session:60, consult:'주말', slots:2, responseMin:25,
    tagline:'AWP 포지셔닝과 유틸 운용으로 라운드를 지배하세요.',
    bio:'CS2 AWPer. 각 잡기, 페이크, 유틸 타이밍 코칭.',
    curriculum:[
      {t:'에임 & 세팅', d:'AWP 무브샷·세팅', m:15},
      {t:'포지셔닝', d:'맵별 각·로테이션', m:30},
      {t:'리뷰', d:'데모 분석', m:15},
    ],
    career:['글로벌 엘리트 유지','누적 코칭 76건'],
    reviewList:[],
  },
];

const REVIEW_TAG_LABELS: Record<string, string> = {
  '설명이명확': '설명이 명확해요',
  '친절': '친절해요',
  '시간준수': '시간을 잘 지켜요',
  '실력향상체감': '실력이 늘었어요',
  '알찬구성': '알찬 구성이에요',
  '콜이정확': '콜이 정확해요',
};

export default function CoachDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const coach = COACHES.find((c) => c.id === id) ?? COACHES[0];
  const [showBooking, setShowBooking] = useState(false);
  const [fav, setFav] = useState(false);

  const g = GAME_GRAD[coach.game] ?? ['#1a1a2e','#16213e'];
  const cat = CATEGORIES.find((c) => c.games.includes(coach.game));

  return (
    <>
      <TopNav />
      <main className="page">
        {/* Back */}
        <Link href="/coaches" className="btn btn-ghost btn-sm" style={{ marginBottom: 20, display:'inline-flex' }}>
          <Icon name="chevL" size={14} />
          목록으로
        </Link>

        {/* Hero card */}
        <div className="card" style={{ overflow:'hidden', marginBottom:24 }}>
          <div style={{ height:220, position:'relative' }}>
            <div style={{ position:'absolute', inset:0, background:`linear-gradient(135deg,${g[0]},${g[1]})` }} />
            <div style={{ position:'absolute', inset:0, opacity:.035, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
            <div style={{ position:'absolute', right:20, bottom:16, opacity:.15, color:'#fff', fontSize:100, lineHeight:1, fontWeight:800 }}>
              {cat?.glyph ?? '○'}
            </div>
            <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 24px', background:'linear-gradient(transparent,rgba(0,0,0,.6))' }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,.6)', textTransform:'uppercase', letterSpacing:'.06em' }}>{coach.game}</div>
            </div>
          </div>
          <div style={{ padding:'20px 24px', display:'flex', alignItems:'flex-start', gap:16 }}>
            <Avatar name={coach.name} idx={coach.avi} size={56} online={coach.online} />
            <div style={{ flex:1 }}>
              <h1 style={{ fontSize:22, fontWeight:900, marginBottom:6 }}>{coach.name}</h1>
              <div className="row gap-6 wrap" style={{ marginBottom:8 }}>
                <span className="badge b-tier">{coach.tier}</span>
                <span className="badge b-game">{coach.position}</span>
                {coach.verify && <span className="badge b-verify"><Icon name="shieldChk" size={10} />인증</span>}
                {coach.discord && <span className="badge b-discord"><Icon name="discord" size={10} />Discord</span>}
              </div>
              <p style={{ fontSize:14, color:'var(--muted)', lineHeight:1.5 }}>{coach.tagline}</p>
            </div>
            <div className="row gap-6">
              <Icon name="star" size={14} fill style={{ color:'#F5A623' }} />
              <span style={{ fontWeight:800 }}>{coach.rating}</span>
              <span style={{ color:'var(--muted)', fontSize:13 }}>({coach.reviews})</span>
            </div>
          </div>
        </div>

        {/* Two-col layout */}
        <div className="detail-grid">
          {/* Left: content */}
          <div className="col gap-20">
            {/* Bio */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:12 }}>코치 소개</h2>
              <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.7 }}>{coach.bio}</p>
            </div>

            {/* Curriculum */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:16 }}>수업 커리큘럼</h2>
              <div className="col gap-0">
                {coach.curriculum.map((item, i) => (
                  <div key={i} style={{ display:'flex', gap:16, alignItems:'flex-start', padding:'14px 0', borderBottom: i < coach.curriculum.length-1 ? '1px solid var(--line)' : 'none' }}>
                    <div style={{ width:28, height:28, borderRadius:8, background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'var(--muted)', flexShrink:0 }}>
                      {i+1}
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:14, marginBottom:3 }}>{item.t}</div>
                      <div style={{ fontSize:13, color:'var(--muted)' }}>{item.d}</div>
                    </div>
                    <span style={{ fontSize:12, color:'var(--muted)', whiteSpace:'nowrap', marginTop:4 }}>{item.m}분</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Career */}
            <div className="card card-pad">
              <h2 className="h3" style={{ marginBottom:14 }}>경력</h2>
              <div className="col gap-10">
                {coach.career.map((c, i) => (
                  <div key={i} className="row gap-10">
                    <Icon name="check" size={16} style={{ color:'var(--success)', flexShrink:0 }} />
                    <span style={{ fontSize:14 }}>{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            {coach.reviewList.length > 0 && (
              <div className="card card-pad">
                <h2 className="h3" style={{ marginBottom:16 }}>
                  수강생 리뷰
                  <span style={{ fontSize:14, color:'var(--muted)', fontWeight:500, marginLeft:8 }}>({coach.reviews}건)</span>
                </h2>
                <div className="col gap-0">
                  {coach.reviewList.map((r, i) => (
                    <div key={i} style={{ padding:'16px 0', borderBottom: i<coach.reviewList.length-1 ? '1px solid var(--line)' : 'none' }}>
                      <div className="row gap-8" style={{ marginBottom:8 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'var(--sunken)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, flexShrink:0 }}>👤</div>
                        <div>
                          <div style={{ fontSize:13, fontWeight:700 }}>{r.by}</div>
                          <div className="row gap-2">
                            {Array.from({length:5}).map((_,j)=>(
                              <Icon key={j} name="star" size={11} fill style={{ color: j<r.rating ? '#F5A623' : 'var(--line-strong)' }} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="row gap-6 wrap" style={{ marginBottom:8 }}>
                        {r.tags.map((tag) => (
                          <span key={tag} className="badge b-ghost">{REVIEW_TAG_LABELS[tag] ?? tag}</span>
                        ))}
                      </div>
                      <p style={{ fontSize:14, color:'var(--ink-soft)', lineHeight:1.6 }}>{r.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Self report note */}
            <div className="notice warn row gap-8">
              <Icon name="warn" size={15} style={{ flexShrink:0 }} />
              <span>이 코치의 티어는 자기 신고 정보를 포함합니다. 수업 전 확인을 권장합니다.</span>
            </div>

            {/* Report link */}
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
                  <span style={{ fontWeight:700 }}>{coach.rating}</span>
                  <span style={{ color:'var(--muted)', fontSize:13 }}>수강후기 {coach.reviews}건</span>
                </div>
                <div>
                  <span className="eth-amt" style={{ fontSize:24, fontWeight:900 }}>{coach.price} ETH</span>
                  <span style={{ fontSize:13, color:'var(--muted)', marginLeft:6 }}>/ {coach.session}분 세션</span>
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
                className={`btn btn-outline btn-block${fav ? '' : ''}`}
                onClick={() => setFav(!fav)}
                style={{ color: fav ? 'var(--danger)' : undefined, borderColor: fav ? 'var(--danger)' : undefined }}
              >
                <Icon name="heart" size={16} fill={fav} />
                {fav ? '찜 해제' : '찜하기'}
              </button>

              <div className="divider" style={{ margin:0 }} />

              <div className="col gap-10">
                {[
                  { icon:'clock', label:'응답시간', val:`평균 ${coach.responseMin}분` },
                  { icon:'calendar', label:'상담 가능', val:coach.consult },
                  { icon:'users', label:'여유 슬롯', val:`${coach.slots}개` },
                  { icon:'book', label:'누적 수업', val:`${coach.lessons}건` },
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
            name: coach.name,
            game: coach.game,
            session: coach.session,
            price: coach.price,
            avi: coach.avi,
          }}
          onClose={() => setShowBooking(false)}
          onBooked={() => setShowBooking(false)}
        />
      )}
    </>
  );
}
