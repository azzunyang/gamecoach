"use client";
import React, { useRef, useEffect, useState } from "react";

const GAME_TOKENS: Record<string, {
  full: string; short: string; cat: string; sym: string;
  accent: string; d1: string; d2: string;
}> = {
  'Valorant':          { full:'VALORANT',          short:'VALORANT', cat:'FPS',      sym:'◎', accent:'#FF4655', d1:'#3A0E16', d2:'#120508' },
  'CS2':               { full:'COUNTER-STRIKE 2',  short:'CS2',      cat:'FPS',      sym:'◉', accent:'#E8A33D', d1:'#2A1E0C', d2:'#130D05' },
  'League of Legends': { full:'LEAGUE OF LEGENDS', short:'LoL',      cat:'MOBA',     sym:'✦', accent:'#C8A24A', d1:'#0B1B33', d2:'#060E1C' },
  'Dota 2':            { full:'DOTA 2',             short:'DOTA2',    cat:'MOBA',     sym:'◆', accent:'#E8621A', d1:'#251508', d2:'#140C04' },
  'TFT':               { full:'TEAMFIGHT TACTICS',  short:'TFT',      cat:'전략',     sym:'▣', accent:'#9B7BFF', d1:'#1E1340', d2:'#0E0820' },
  'Overwatch 2':       { full:'OVERWATCH 2',        short:'OW2',      cat:'팀파이트', sym:'❖', accent:'#F99E1A', d1:'#33230B', d2:'#170E04' },
  'PUBG':              { full:'PUBG',               short:'PUBG',     cat:'배틀로얄', sym:'◈', accent:'#F2A900', d1:'#322611', d2:'#171005' },
  'Brawl Stars':       { full:'BRAWL STARS',        short:'BRAWL',    cat:'캐주얼',   sym:'★', accent:'#E040FB', d1:'#200835', d2:'#0E0418' },
  'StarCraft 2':       { full:'STARCRAFT II',       short:'SC2',      cat:'전략',     sym:'▲', accent:'#29B6F6', d1:'#061528', d2:'#040B18' },
};
const DEFAULT_TOKEN = { full:'GAMECOACH', short:'GAME', cat:'기타', sym:'◎', accent:'#CDF24A', d1:'#101810', d2:'#080E0A' };

const LIME = '#C9F24D';
const INK  = '#16160F';

// 16:9 기준 사이즈
const BASE_W = 560;
const BASE_H = 315;

interface LectureThumbnailProps {
  game: string;
  title: string;
  coachName?: string;
  tier?: string;
  level?: string;
  price?: string;
  duration?: number;
  position?: string;
  height?: number;
}

export default function LectureThumbnail({
  game, title, coachName, tier, level, price, duration, position, height,
}: LectureThumbnailProps) {
  const g = GAME_TOKENS[game] ?? DEFAULT_TOKEN;
  const mins = duration ? `${duration}분` : '';
  const chipParts = [g.cat, level, mins].filter(Boolean);
  const chipLabel = chipParts.join(' · ');
  const shortTitle = title.length > 18 ? title.slice(0, 18) + '…' : title;

  // ── 반응형 스케일 계산 ──
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5); // SSR 초기값

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = (w: number) => { if (w > 0) setScale(w / BASE_W); };
    update(el.getBoundingClientRect().width); // 즉시 측정
    const ro = new ResizeObserver(([entry]) => update(entry.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    // aspect-ratio로 16:9 유지, width 100%로 부모에 꽉 채움
    <div
      ref={containerRef}
      style={{
        width: '100%',
        ...(height ? { height } : { aspectRatio: `${BASE_W} / ${BASE_H}` }),
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* 고정 560×315 내용물 — scale로 축소/확대 */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: BASE_W, height: BASE_H,
        transformOrigin: 'top left',
        transform: `scale(${scale})`,
        fontFamily: 'Pretendard, -apple-system, "Apple SD Gothic Neo", sans-serif',
      }}>
        {/* 배경: 흰색 */}
        <div style={{ position:'absolute', inset:0, background:'#FFFFFF' }} />

        {/* 대각 다크 패널 */}
        <div style={{
          position:'absolute', inset:0,
          background:`linear-gradient(150deg, ${g.d1} 0%, ${g.d2} 100%)`,
          clipPath:'polygon(0 0, 60% 0, 42% 100%, 0 100%)',
        }} />

        {/* 심볼 워터마크 */}
        <div style={{
          position:'absolute', left:-20, bottom:-60,
          fontSize:280, lineHeight:1,
          color:g.accent, opacity:0.2, fontWeight:700,
          fontFamily:'system-ui, sans-serif',
          userSelect:'none', pointerEvents:'none',
        }}>
          {g.sym}
        </div>

        {/* 왼쪽: 게임 워드마크 + 포지션 */}
        <div style={{ position:'absolute', left:28, top:26, maxWidth:230 }}>
          <div style={{
            fontFamily:'Archivo, "Impact", "Arial Black", sans-serif',
            fontSize:50, fontWeight:900, color:'#fff',
            lineHeight:0.92, letterSpacing:'-0.02em',
          }}>
            {g.short}
          </div>
          {position && (
            <div style={{
              fontSize:13, fontWeight:700, color: g.accent,
              marginTop:10, letterSpacing:'0.04em', textTransform:'lowercase',
              fontFamily:'"JetBrains Mono","Courier New",monospace',
            }}>
              {position}
            </div>
          )}
        </div>

        {/* 오른쪽: 칩 + 제목 */}
        <div style={{
          position:'absolute', right:26, top:26, bottom:56,
          width:240, display:'flex', flexDirection:'column',
          alignItems:'flex-end', justifyContent:'flex-end',
          textAlign:'right', gap:10,
        }}>
          <span style={{
            display:'inline-flex', alignItems:'center',
            padding:'4px 10px', borderRadius:999,
            fontSize:12, fontWeight:700,
            background:INK, color:'#fff',
            letterSpacing:'-0.01em', whiteSpace:'nowrap',
          }}>
            {chipLabel || g.cat}
          </span>
          <div style={{
            fontSize:24, fontWeight:800, color:INK,
            lineHeight:1.15, letterSpacing:'-0.02em',
            wordBreak:'keep-all',
          }}>
            {shortTitle}
          </div>
        </div>

        {/* 하단 왼쪽: GameCoach 브랜드 */}
        <div style={{
          position:'absolute', left:28, bottom:22,
          display:'flex', alignItems:'center', gap:5,
        }}>
          <div style={{
            width:18, height:18, borderRadius:5, background:INK,
            display:'grid', placeItems:'center',
            color:LIME, fontWeight:900, fontSize:12,
            fontFamily:'Archivo, "Arial Black", sans-serif',
          }}>G</div>
          <span style={{ fontSize:12, fontWeight:700, color:'rgba(22,22,15,.45)' }}>
            GameCoach
          </span>
        </div>

        {/* 하단 오른쪽: 코치 + ETH */}
        <div style={{
          position:'absolute', right:26, bottom:22,
          display:'flex', alignItems:'center', gap:8,
        }}>
          {coachName && (
            <span style={{
              fontSize:11, color:'rgba(22,22,15,.38)',
              fontFamily:'"JetBrains Mono","Courier New",monospace',
              whiteSpace:'nowrap',
              maxWidth:110, overflow:'hidden', textOverflow:'ellipsis',
            }}>
              {coachName}{tier ? ` · ${tier}` : ''}
            </span>
          )}
          {price && (
            <span style={{
              background:INK, color:LIME,
              padding:'3px 8px', borderRadius:5,
              fontWeight:700, fontSize:11,
              fontFamily:'"JetBrains Mono","Courier New",monospace',
              whiteSpace:'nowrap',
            }}>
              {price} ETH
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
