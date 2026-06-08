"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";
import LectureThumbnail from "@/components/LectureThumbnail";
import BookingModal from "@/components/BookingModal";

const GAME_GRAD: Record<string, [string, string]> = {
  'Valorant':          ['#2A1216','#5A1E27'],
  'CS2':               ['#15202B','#2C3E50'],
  'League of Legends': ['#0E1726','#1E3A5F'],
  'Dota 2':            ['#1A1410','#3A2417'],
  'TFT':               ['#1B1430','#3A2A5C'],
  'Overwatch 2':       ['#1E1409','#52340C'],
  'PUBG':              ['#161616','#3A3A2A'],
  'Brawl Stars':       ['#1A0E22','#43215C'],
};

const CATEGORIES = [
  { id:'fps',    name:'FPS',      glyph:'◎', games:['Valorant','CS2'],             count:48, hue:8   },
  { id:'moba',   name:'MOBA',     glyph:'✦', games:['League of Legends','Dota 2'], count:63, hue:222 },
  { id:'strat',  name:'전략',     glyph:'▣', games:['TFT','StarCraft 2'],           count:21, hue:268 },
  { id:'team',   name:'팀파이트', glyph:'❖', games:['Overwatch 2'],                 count:17, hue:28  },
  { id:'br',     name:'배틀로얄', glyph:'◈', games:['PUBG'],                        count:14, hue:158 },
  { id:'casual', name:'캐주얼',   glyph:'○', games:['Brawl Stars'],                 count:9,  hue:330 },
];

const FEATURED = [
  { id:'dragonking', name:'DragonKing', game:'League of Legends', cat:'moba', tier:'챌린저',       position:'jungle',  price:0.05,  rating:4.9,  reviews:127, avi:2, online:true,  slogan:'정글의 모든 디테일을 여기서',      tagline:'정글 동선·오브젝트 설계로 게임을 읽는 법을 가르칩니다.' },
  { id:'shadowace',  name:'ShadowAce',  game:'Valorant',          cat:'fps',  tier:'다이아 2',      position:'duelist', price:0.04,  rating:4.80, reviews:89,  avi:0, online:false, slogan:'1등을 꺾는 에임, 지금 시작하세요',  tagline:'에임 루틴과 엔트리 동선으로 라운드 주도권을 잡으세요.' },
  { id:'frostqueen', name:'FrostQueen', game:'Overwatch 2',        cat:'team', tier:'그랜드마스터',  position:'support', price:0.045, rating:4.95, reviews:64,  avi:5, online:true,  slogan:'팀파이트는 힐러가 설계합니다',      tagline:'힐러 포지셔닝과 궁극기 운용으로 팀파이트를 설계합니다.' },
];

const LESSONS = [
  { id:'l1', title:'Valorant 에임 집중 1:1 코칭',    coachId:'shadowace',   coach:'ShadowAce',   game:'Valorant',          duration:60, price:0.04,  rating:4.8,  students:89  },
  { id:'l2', title:'LoL 정글 동선 완전 마스터',       coachId:'dragonking',  coach:'DragonKing',  game:'League of Legends', duration:60, price:0.05,  rating:4.9,  students:127 },
  { id:'l3', title:'오버워치2 서포터 포지셔닝 심화',  coachId:'frostqueen',  coach:'FrostQueen',  game:'Overwatch 2',       duration:60, price:0.045, rating:4.95, students:64  },
  { id:'l4', title:'TFT 메타 덱 & 경제 완전 정복',    coachId:'tigerstrat',  coach:'tig3r_strat', game:'TFT',               duration:60, price:0.035, rating:4.70, students:41  },
  { id:'l5', title:'PUBG 자기장 운영 & 교전 판단',    coachId:'voidpubg',    coach:'VoidWalker',  game:'PUBG',              duration:90, price:0.04,  rating:4.60, students:33  },
  { id:'l6', title:'CS2 AWP 포지셔닝 집중 코칭',      coachId:'csgodemon',   coach:'demon.cs',    game:'CS2',               duration:60, price:0.05,  rating:4.85, students:52  },
];

const TRUST = [
  { icon:'lock',      title:'스마트컨트랙트 에스크로', desc:'결제금은 컨트랙트에 잠기고, 수업 완료 시 코치에게 자동 정산됩니다.' },
  { icon:'shieldChk', title:'검증된 코치',             desc:'본인인증·Discord 연동을 거친 코치만 활동 가능합니다.' },
  { icon:'refresh',   title:'자동 환불',               desc:'코치가 거절하면 예약금이 지갑으로 즉시 환불됩니다.' },
  { icon:'star',      title:'투명한 리뷰',             desc:'수업 완료 학생만 남길 수 있는 익명 검증 리뷰입니다.' },
];

const STEPS = [
  { icon:'compass',  n:'01', title:'코치 탐색',  desc:'게임·티어·가격으로 딱 맞는 코치를 찾아요.' },
  { icon:'calendar', n:'02', title:'슬롯 신청',  desc:'원하는 날짜를 고르고 예약금 30%만 먼저 결제해요.' },
  { icon:'video',    n:'03', title:'1:1 수업',   desc:'Discord 음성+화면 공유로 실시간 1:1 코칭을 받아요.' },
  { icon:'check',    n:'04', title:'완료 & 정산', desc:'수업 완료 후 리뷰를 남기면 잔금이 코치에게 전달돼요.' },
];

/* ── 썸네일 배너 ── */
function CoachThumb({ game, h = 160, glyph }: { game: string; h?: number; glyph?: string }) {
  const cat = CATEGORIES.find((c) => c.games.includes(game));
  const g = GAME_GRAD[game] ?? ['#1a2b0a','#2d4a10'];
  return (
    <div className="thumb" style={{ height: h }}>
      <div className="thumb-grad" style={{ background: `linear-gradient(135deg,${g[0]},${g[1]})` }} />
      <div className="thumb-noise" />
      <div style={{ position:'absolute', right:14, bottom:10, opacity:.18, color:'#fff', fontSize:56, lineHeight:1, fontWeight:900 }}>
        {glyph ?? cat?.glyph ?? '○'}
      </div>
      <div className="thumb-game">{game}</div>
    </div>
  );
}

/* ── 강의 썸네일 카드 (모크 폴백) ── */
function LessonCard({ l }: { l: typeof LESSONS[0] }) {
  return (
    <Link href={`/coaches/${l.coachId}`} style={{ textDecoration:'none' }}>
      <div className="card hover-lift" style={{ overflow:'hidden', cursor:'pointer' }}>
        <LectureThumbnail
          game={l.game}
          title={l.title}
          coachName={l.coach}
          price={String(l.price)}
          duration={l.duration}
        />
      </div>
    </Link>
  );
}

/* ── 코치 카드 ── */
function CoachCard({ c, big = false }: { c: typeof FEATURED[0]; big?: boolean }) {
  return (
    <Link href={`/coaches/${c.id}`} className="card hover-lift" style={{ overflow:'hidden', display:'block', textDecoration:'none' }}>
      <LectureThumbnail
        game={c.game}
        title={c.slogan}
        coachName={c.name}
        tier={c.tier}
        price={String(c.price)}
        position={c.position}
        height={big ? 190 : 130}
      />
      <div style={{ padding: '14px 16px 16px' }}>
        <div className="row gap-10" style={{ marginBottom: 10 }}>
          <Avatar name={c.name} idx={c.avi} size={big ? 42 : 36} online={c.online} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight: 800, fontSize: big ? 15.5 : 14 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)' }}>{c.position}</div>
          </div>
          <div style={{ textAlign:'right', flexShrink:0 }}>
            <div className="eth-amt" style={{ fontSize: 13.5, fontWeight: 800 }}>{c.price} ETH</div>
            <div style={{ fontSize: 11, color: 'var(--muted)' }}>/세션</div>
          </div>
        </div>
        <div className="row gap-6 wrap" style={{ marginBottom: 10 }}>
          <span className="badge b-tier">{c.tier}<span className="self"> · 자기신고</span></span>
          <span className="badge b-game" style={{ fontSize:11 }}>{c.game}</span>
        </div>
        {big && (
          <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 10 }}>{c.tagline}</p>
        )}
        <div className="row gap-6">
          <Icon name="star" size={13} fill style={{ color:'#E8910C' }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{c.rating}</span>
          <span style={{ fontSize: 12, color:'var(--muted)' }}>({c.reviews}개 리뷰)</span>
        </div>
      </div>
    </Link>
  );
}

interface ApiLecture {
  id: string; title: string; game: string; game_category: string;
  price_eth: string; duration: number; level: string;
  coach_id: string; coach_nickname: string;
}

export default function LandingPage() {
  const [apiLectures, setApiLectures] = useState<ApiLecture[]>([]);
  const [bookingTarget, setBookingTarget] = useState<ApiLecture | null>(null);

  useEffect(() => {
    fetch("/api/lectures?page=1")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const data = d as { lectures?: ApiLecture[] } | null;
        if (data?.lectures && data.lectures.length > 0) setApiLectures(data.lectures.slice(0, 6));
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <TopNav />
      <main>

        {/* ── 히어로 ── */}
        <section style={{ paddingTop: 'calc(var(--nav-h) + 48px)', paddingBottom: 80, background: 'var(--paper)' }}>
          <div className="container">
            <div className="hero-grid">

              {/* 왼쪽: 텍스트 */}
              <div className="col gap-32">
                <div className="col gap-20">
                  <span className="badge b-accent" style={{ alignSelf:'flex-start', padding:'6px 12px' }}>
                    <Icon name="shieldChk" size={13} />
                    블록체인 에스크로 · 안전결제
                  </span>

                  <h1 className="h1">
                    게임 실력,{" "}
                    <br />
                    검증된 고수에게{" "}
                    <br />
                    <span style={{ position:'relative', display:'inline-block' }}>
                      <span style={{ position:'relative', zIndex:1 }}>1:1로 배우다</span>
                      <span style={{ position:'absolute', left:-4, right:-4, bottom:'12%', height:'32%', background:'var(--accent)', zIndex:0, borderRadius:4, display:'block' }} />
                    </span>
                  </h1>

                  <p className="sub" style={{ fontSize: 16, lineHeight:1.65, maxWidth: 440 }}>
                    챌린저·그랜드마스터 코치에게 직접 코칭받고,<br />
                    스마트 컨트랙트로 안전하게 결제하세요.
                  </p>
                </div>

                {/* CTA 버튼 */}
                <div className="row gap-12 wrap">
                  <Link href="/coaches" className="btn btn-primary btn-lg">
                    <Icon name="compass" size={18} />
                    코치 둘러보기
                  </Link>
                  <Link href="/auth/register" className="btn btn-accent btn-lg">
                    회원가입
                  </Link>
                </div>

                {/* 통계 */}
                <div style={{ display:'flex', gap:0, alignItems:'stretch' }}>
                  {[
                    { val:'172', lbl:'활동 코치' },
                    { val:'3,400+', lbl:'완료 수업' },
                    { val:'4.86', lbl:'평균 별점' },
                  ].map((s, i) => (
                    <div key={s.lbl} style={{
                      flex:1,
                      paddingRight: i < 2 ? 24 : 0,
                      marginRight: i < 2 ? 24 : 0,
                      borderRight: i < 2 ? '1px solid var(--line)' : 'none',
                    }}>
                      <div style={{ fontSize: 26, fontWeight: 900, fontFamily:'var(--mono)', letterSpacing:'-0.03em', color:'var(--ink)' }}>
                        {s.val}
                      </div>
                      <div style={{ fontSize: 12.5, color:'var(--muted)', marginTop: 3, fontWeight: 600 }}>
                        {s.lbl}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 오른쪽: 코치 카드 */}
              <div className="col gap-14">
                <CoachCard c={FEATURED[0]} big />
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                  <CoachCard c={FEATURED[1]} />
                  <CoachCard c={FEATURED[2]} />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 카테고리 ── */}
        <section style={{ padding:'64px 0', background:'var(--surface)' }}>
          <div className="container">
            <div className="row spread" style={{ marginBottom:28, alignItems:'center' }}>
              <div>
                <p className="eyebrow" style={{ marginBottom:5 }}>카테고리</p>
                <h2 className="h2" style={{ fontSize:22 }}>어떤 게임을 배우고 싶으세요?</h2>
              </div>
              <Link href="/coaches" className="btn btn-outline btn-sm">전체 보기</Link>
            </div>
            <div className="grid grid-3 gap-12">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/coaches?cat=${cat.id}`}
                  style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none',
                    padding:'14px 16px', borderRadius:'var(--r)',
                    border:'1px solid var(--line)', background:'var(--paper)',
                    transition:'border-color .15s, background .15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-tint)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--line)'; (e.currentTarget as HTMLElement).style.background = 'var(--paper)'; }}
                >
                  <div style={{
                    width:44, height:44, borderRadius:12,
                    background:'var(--sunken)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:20, flexShrink:0, color:'var(--ink)',
                  }}>
                    {cat.glyph}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:14.5, color:'var(--ink)' }}>{cat.name}</div>
                    <div style={{ fontSize:11.5, color:'var(--muted)', marginTop:1, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{cat.games.slice(0,2).join(' · ')}</div>
                  </div>
                  <span style={{ fontSize:12, fontWeight:700, color:'var(--muted)', whiteSpace:'nowrap' }}>{cat.count}명</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── 추천 강의 ── */}
        <section style={{ padding:'72px 0', background:'var(--paper)' }}>
          <div className="container">
            <div className="row spread" style={{ marginBottom:32, alignItems:'flex-end' }}>
              <div>
                <p className="eyebrow" style={{ marginBottom:6 }}>추천 강의</p>
                <h2 className="h2">지금 인기 있는 강의</h2>
              </div>
              <Link href="/coaches" className="btn btn-outline btn-sm">전체 보기</Link>
            </div>
            <div className="grid grid-3 gap-16">
              {apiLectures.length > 0
                ? apiLectures.map((l) => (
                    <div
                      key={l.id}
                      className="card hover-lift"
                      style={{ overflow:'hidden', cursor:'pointer', borderRadius:'var(--r)' }}
                      onClick={() => setBookingTarget(l)}
                    >
                      <LectureThumbnail
                        game={l.game}
                        title={l.title}
                        coachName={l.coach_nickname}
                        level={l.level}
                        price={l.price_eth}
                        duration={l.duration}
                      />
                    </div>
                  ))
                : LESSONS.map((l) => <LessonCard key={l.id} l={l} />)
              }
            </div>
            {apiLectures.length === 0 && (
              <p style={{ textAlign:'center', color:'var(--muted)', fontSize:13, marginTop:12 }}>아직 등록된 강의가 없어요. 첫 번째 강의를 등록해보세요!</p>
            )}
          </div>
        </section>

        {/* ── 신뢰 포인트 (아이보리 배경, 컴팩트) ── */}
        <section style={{ padding:'52px 0', background:'var(--sunken)', borderTop:'1px solid var(--line)', borderBottom:'1px solid var(--line)' }}>
          <div className="container">
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:0 }}>
              {TRUST.map((t, i) => (
                <div key={t.title} style={{
                  display:'flex', flexDirection:'column', alignItems:'flex-start', gap:10,
                  padding:'0 32px',
                  borderRight: i < TRUST.length - 1 ? '1px solid var(--line-strong)' : 'none',
                }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent-ink)', flexShrink:0 }}>
                    <Icon name={t.icon as "lock"} size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:14, color:'var(--ink)', marginBottom:4 }}>{t.title}</div>
                    <p style={{ fontSize:12.5, color:'var(--muted)', lineHeight:1.6 }}>{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 이용 방법 (맨 아래) ── */}
        <section style={{ padding:'80px 0', background:'var(--surface)' }}>
          <div className="container">
            <div style={{ textAlign:'center', marginBottom:48 }}>
              <p className="eyebrow" style={{ marginBottom:8 }}>How it works</p>
              <h2 className="h2">4단계로 끝나는 1:1 코칭</h2>
              <p className="sub" style={{ marginTop:10, fontSize:14.5 }}>예약금 30% 선납 · 잔액은 코치 수락 후</p>
            </div>
            <div className="grid grid-4 gap-20">
              {STEPS.map((s) => (
                <div key={s.title} className="card card-pad" style={{ textAlign:'center', position:'relative' }}>
                  <div style={{ display:'inline-flex', width:52, height:52, borderRadius:'var(--r)', background:'var(--ink)', alignItems:'center', justifyContent:'center', marginBottom:16, color:'var(--accent)' }}>
                    <Icon name={s.icon as "compass"} size={24} />
                  </div>
                  <div style={{ position:'absolute', top:20, right:20, fontFamily:'var(--mono)', fontSize:12, fontWeight:800, color:'var(--faint)' }}>{s.n}</div>
                  <div style={{ fontWeight:800, fontSize:15.5, marginBottom:8 }}>{s.title}</div>
                  <p style={{ fontSize:13, color:'var(--muted)', lineHeight:1.55 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 푸터 ── */}
        <footer style={{ borderTop:'1px solid var(--line)', padding:'32px 0', background:'var(--surface)' }}>
          <div className="container row spread wrap gap-16">
            <div className="row gap-10">
              <div className="brand-ic" style={{ fontSize:15 }}>G</div>
              <span style={{ fontWeight:800, fontSize:16 }}>GameCoach</span>
              <span style={{ fontSize:12, color:'var(--muted)', marginLeft:4 }}>· Ethereum Sepolia</span>
            </div>
            <div style={{ fontSize:13, color:'var(--muted)' }}>© 2026 GameCoach. 프로토타입</div>
            <div className="row gap-16">
              {['이용약관','개인정보처리방침','고객지원'].map((l) => (
                <a key={l} href="#" style={{ fontSize:13, color:'var(--muted)', textDecoration:'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </footer>
      </main>
      <BottomNav />
      {bookingTarget && (
        <BookingModal
          coach={{
            id: bookingTarget.coach_id,
            name: bookingTarget.coach_nickname,
            game: bookingTarget.game,
            session: bookingTarget.duration,
            price: parseFloat(bookingTarget.price_eth),
            avi: 0,
          }}
          onClose={() => setBookingTarget(null)}
          onBooked={() => setBookingTarget(null)}
        />
      )}
    </>
  );
}
