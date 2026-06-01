"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

const GAME_GRAD: Record<string, [string, string]> = {
  'Valorant':           ['#2A1216','#5A1E27'],
  'CS2':                ['#15202B','#2C3E50'],
  'League of Legends':  ['#0E1726','#1E3A5F'],
  'Dota 2':             ['#1A1410','#3A2417'],
  'TFT':                ['#1B1430','#3A2A5C'],
  'Overwatch 2':        ['#1E1409','#52340C'],
  'PUBG':               ['#161616','#3A3A2A'],
  'Brawl Stars':        ['#1A0E22','#43215C'],
};

const CATEGORIES = [
  { id:'fps',    name:'FPS',      glyph:'◎', games:['Valorant','CS2'],              count:48 },
  { id:'moba',   name:'MOBA',     glyph:'✦', games:['League of Legends','Dota 2'],  count:63 },
  { id:'strat',  name:'전략',     glyph:'▣', games:['TFT','StarCraft 2'],            count:21 },
  { id:'team',   name:'팀파이트', glyph:'❖', games:['Overwatch 2'],                  count:17 },
  { id:'br',     name:'배틀로얄', glyph:'◈', games:['PUBG'],                         count:14 },
  { id:'casual', name:'캐주얼',   glyph:'○', games:['Brawl Stars'],                  count:9  },
];

const MOCK_COACHES = [
  { id:'dragonking', nickname:'DragonKing', game_category:'moba', game:'League of Legends',
    tier:'챌린저', position:'정글', price_eth:'0.05', avg_rating:4.9, review_count:127, session_min:60,
    tier_self:0, avi:2, online:true },
  { id:'shadowace', nickname:'ShadowAce', game_category:'fps', game:'Valorant',
    tier:'다이아 2', position:'타격대', price_eth:'0.04', avg_rating:4.8, review_count:89, session_min:60,
    tier_self:0, avi:0, online:false },
  { id:'frostqueen', nickname:'FrostQueen', game_category:'team', game:'Overwatch 2',
    tier:'그랜드마스터', position:'서포터', price_eth:'0.045', avg_rating:4.95, review_count:64, session_min:60,
    tier_self:0, avi:5, online:true },
  { id:'tigerstrat', nickname:'tig3r_strat', game_category:'strat', game:'TFT',
    tier:'마스터', position:'-', price_eth:'0.035', avg_rating:4.7, review_count:41, session_min:60,
    tier_self:0, avi:3, online:false },
  { id:'voidpubg', nickname:'VoidWalker', game_category:'br', game:'PUBG',
    tier:'다이아', position:'IGL', price_eth:'0.04', avg_rating:4.6, review_count:33, session_min:90,
    tier_self:0, avi:7, online:true },
  { id:'csgodemon', nickname:'demon.cs', game_category:'fps', game:'CS2',
    tier:'글로벌 엘리트', position:'AWP', price_eth:'0.05', avg_rating:4.85, review_count:52, session_min:60,
    tier_self:0, avi:1, online:false },
];

type Coach = typeof MOCK_COACHES[0];

function CoachThumb({ game, cat }: { game: string; cat: string }) {
  const catInfo = CATEGORIES.find((c) => c.id === cat);
  const g = GAME_GRAD[game] ?? ['#1a1a2e','#16213e'];
  return (
    <div className="thumb" style={{ height:150 }}>
      <div className="thumb-grad" style={{ background:`linear-gradient(135deg,${g[0]},${g[1]})` }} />
      <div className="thumb-noise" />
      <div style={{ position:'absolute', right:14, bottom:12, opacity:.16, color:'#fff', fontSize:56, lineHeight:1, fontWeight:800 }}>
        {catInfo?.glyph ?? '○'}
      </div>
      <div className="thumb-game">{game}</div>
    </div>
  );
}

function CoachCard({ c }: { c: Coach }) {
  return (
    <Link href={`/coaches/${c.id}`} className="card hover-lift" style={{ overflow:'hidden', display:'block', textDecoration:'none' }}>
      <CoachThumb game={c.game ?? ''} cat={c.game_category} />
      <div style={{ padding:'16px 16px 18px' }}>
        <div className="row gap-8" style={{ marginBottom:10 }}>
          <Avatar name={c.nickname} idx={c.avi ?? 0} size={38} online={c.online} />
          <div>
            <div style={{ fontWeight:800, fontSize:14 }}>{c.nickname}</div>
            <div style={{ fontSize:12, color:'var(--muted)' }}>{c.position ?? c.game_category}</div>
          </div>
          <div style={{ marginLeft:'auto', textAlign:'right' }}>
            <span className="eth-amt" style={{ fontSize:13, fontWeight:800 }}>{c.price_eth} ETH</span>
            <div style={{ fontSize:11, color:'var(--muted)' }}>/세션</div>
          </div>
        </div>
        <div className="row gap-6 wrap" style={{ marginBottom:10 }}>
          <span className="badge b-tier">{c.tier}</span>
          {!c.tier_self && <span className="badge b-verify"><Icon name="shieldChk" size={10} />인증</span>}
        </div>
        <div className="row gap-6">
          <Icon name="star" size={13} fill style={{ color:'#F5A623' }} />
          <span style={{ fontSize:13, fontWeight:700 }}>{c.avg_rating.toFixed(1)}</span>
          <span style={{ fontSize:12, color:'var(--muted)' }}>({c.review_count})</span>
          <span style={{ fontSize:12, color:'var(--muted)', marginLeft:'auto' }}>{c.session_min}분</span>
        </div>
      </div>
    </Link>
  );
}

function BrowseContent() {
  const searchParams = useSearchParams();
  const catParam = searchParams.get("cat");
  const [activeCat, setActiveCat] = useState<string | null>(catParam);
  const [sort, setSort] = useState("rating");
  const [coaches, setCoaches] = useState<Coach[]>(MOCK_COACHES);

  useEffect(() => {
    const q = activeCat ? `?category=${activeCat}` : "";
    fetch(`/api/coaches${q}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const d = data as { coaches?: Coach[] } | null;
        if (d?.coaches && d.coaches.length > 0) setCoaches(d.coaches);
      })
      .catch(() => {});
  }, [activeCat]);

  const filtered = coaches.filter((c) => !activeCat || c.game_category === activeCat);
  const sorted = [...filtered].sort((a, b) => {
    if (sort === "rating")     return b.avg_rating - a.avg_rating;
    if (sort === "price_asc")  return parseFloat(a.price_eth) - parseFloat(b.price_eth);
    if (sort === "price_desc") return parseFloat(b.price_eth) - parseFloat(a.price_eth);
    return b.review_count - a.review_count;
  });

  return (
    <>
      <TopNav />
      <main className="page">
        <div style={{ marginBottom:40 }}>
          <p className="eyebrow" style={{ marginBottom:8 }}>카테고리</p>
          <h1 className="h2" style={{ marginBottom:24 }}>코치 찾기</h1>
          <div className="grid-3 gap-14">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(activeCat === cat.id ? null : cat.id)}
                className="card card-pad hover-lift"
                style={{
                  display:'flex', alignItems:'center', gap:14, textAlign:'left', cursor:'pointer',
                  border: activeCat === cat.id ? '2px solid var(--ink)' : '1px solid var(--line)',
                  background: activeCat === cat.id ? 'var(--sunken)' : 'var(--surface)',
                }}
              >
                <div style={{
                  width:46, height:46, borderRadius:'var(--r)',
                  background: activeCat === cat.id ? 'var(--ink)' : 'var(--sunken)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:20, flexShrink:0,
                  color: activeCat === cat.id ? 'var(--accent)' : 'var(--ink-soft)',
                  transition:'all .15s',
                }}>
                  {cat.glyph}
                </div>
                <div>
                  <div style={{ fontWeight:800, fontSize:14 }}>{cat.name}</div>
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:2 }}>{cat.count}명의 코치</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="spread" style={{ marginBottom:20 }}>
            <h2 className="h3">
              {activeCat ? CATEGORIES.find(c=>c.id===activeCat)?.name : '인기 코치'}
              <span style={{ fontSize:14, color:'var(--muted)', fontWeight:500, marginLeft:8 }}>{sorted.length}명</span>
            </h2>
            <div className="seg">
              {[
                { val:'rating',    label:'별점순' },
                { val:'reviews',   label:'리뷰순' },
                { val:'price_asc', label:'낮은가격' },
              ].map((s) => (
                <button key={s.val} className={sort===s.val?'on':''} onClick={()=>setSort(s.val)}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {sorted.length === 0 ? (
            <div style={{ textAlign:'center', padding:'60px 0', color:'var(--muted)' }}>
              <Icon name="compass" size={40} style={{ margin:'0 auto 12px', display:'block' }} />
              <div style={{ fontWeight:700 }}>해당 카테고리에 코치가 없어요</div>
            </div>
          ) : (
            <div className="grid-3 gap-20">
              {sorted.map((c) => <CoachCard key={c.id} c={c} />)}
            </div>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}

export default function CoachesPage() {
  return (
    <Suspense fallback={<div className="page">로딩중...</div>}>
      <BrowseContent />
    </Suspense>
  );
}
