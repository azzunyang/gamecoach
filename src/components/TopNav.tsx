"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./Icon";
import Avatar from "./Avatar";

interface Me {
  id: string;
  address: string;
  role: "student" | "coach" | "admin" | null;
  nickname?: string;
  is_admin?: number;
}

const GAMES = [
  { name: "League of Legends", label: "리그 오브 레전드", sym: "✦", cat: "moba",   accent: "#C8A24A" },
  { name: "Valorant",          label: "발로란트",         sym: "◎", cat: "fps",    accent: "#FF4655" },
  { name: "CS2",               label: "CS2",              sym: "◉", cat: "fps",    accent: "#E8A33D" },
  { name: "Overwatch 2",       label: "오버워치 2",       sym: "❖", cat: "team",   accent: "#F99E1A" },
  { name: "TFT",               label: "전략적 팀 전투",   sym: "▣", cat: "strat",  accent: "#9B7BFF" },
  { name: "PUBG",              label: "배틀그라운드",     sym: "◈", cat: "br",     accent: "#F2A900" },
  { name: "Dota 2",            label: "도타 2",           sym: "◆", cat: "moba",   accent: "#E8621A" },
  { name: "Brawl Stars",       label: "브롤스타즈",       sym: "★", cat: "casual", accent: "#E040FB" },
];

const CATEGORIES = [
  { id: "fps",    label: "FPS",       sym: "◎", desc: "발로란트, CS2" },
  { id: "moba",   label: "MOBA",      sym: "✦", desc: "LoL, 도타 2" },
  { id: "team",   label: "팀파이트",  sym: "❖", desc: "오버워치 2" },
  { id: "strat",  label: "전략",      sym: "▣", desc: "TFT, 스타크래프트" },
  { id: "br",     label: "배틀로얄",  sym: "◈", desc: "PUBG" },
  { id: "casual", label: "캐주얼",    sym: "★", desc: "브롤스타즈" },
];

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [dropOpen, setDropOpen] = useState<"lectures" | "coaches" | null>(null);

  const menuRef   = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const dropRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { const d = data as Me | null; if (d?.id) setMe(d); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current   && !menuRef.current.contains(e.target as Node))   setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (dropRef.current   && !dropRef.current.contains(e.target as Node))   setDropOpen(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    router.push("/");
    router.refresh();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    router.push(`/coaches?q=${encodeURIComponent(searchQ.trim())}`);
    setSearchOpen(false);
    setSearchQ("");
  };

  const isOn = (href: string, exact = false) => {
    if (href === "/") return pathname === "/";
    if (href.includes("?")) return false;
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const baseLinks = () => {
    if (me?.role === "coach") return [
      { label: "대시보드",  href: "/dashboard/coach",          exact: true  },
      { label: "강의 관리", href: "/dashboard/coach/lectures",  exact: false },
    ];
    if (me?.role === "student") return [
      { label: "내 수업",  href: "/dashboard/student", exact: true  },
      { label: "메시지",   href: "/chat",              exact: false },
    ];
    return [] as { label: string; href: string; exact: boolean }[];
  };

  const dashHref = me?.role === "coach" ? "/dashboard/coach" : "/dashboard/student";

  const toggleDrop = (key: "lectures" | "coaches") =>
    setDropOpen((o) => o === key ? null : key);

  return (
    <nav className="topnav">
      <div className="topnav-in">
        {/* 브랜드 */}
        <Link href="/" className="brand">
          <div className="brand-ic">G</div>
          GameCoach
        </Link>

        {/* 중앙 링크 + 드롭다운 */}
        <div className="nav-links" ref={dropRef} style={{ position: "relative" }}>

          {/* ── 강의 목록 드롭다운 ── */}
          <button
            className={`nav-link${isOn("/coaches") ? " on" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)" }}
            onClick={() => toggleDrop("lectures")}
          >
            강의 목록
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"
              style={{ transition: "transform .2s", transform: dropOpen === "lectures" ? "rotate(180deg)" : "none" }}>
              <path d="M6 8L1 3h10z"/>
            </svg>
          </button>

          {dropOpen === "lectures" && (
            <div style={{
              position: "absolute", top: "calc(100% + 14px)", left: 0,
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: "var(--r)", boxShadow: "0 12px 32px rgba(0,0,0,.12)",
              padding: "16px", zIndex: 300, minWidth: 420,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12, padding: "0 4px" }}>
                게임별 강의
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {GAMES.map((g) => (
                  <Link
                    key={g.name}
                    href={`/coaches?cat=${g.cat}&game=${encodeURIComponent(g.name)}`}
                    onClick={() => setDropOpen(null)}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", borderRadius: 10, textDecoration: "none", color: "var(--ink)", transition: "background .12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                      background: "var(--sunken)", border: "1px solid var(--line)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16, color: g.accent,
                    }}>
                      {g.sym}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{g.label}</span>
                  </Link>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12 }}>
                <Link
                  href="/coaches"
                  onClick={() => setDropOpen(null)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderRadius: 10, textDecoration: "none", color: "var(--muted)", fontSize: 13, fontWeight: 600 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  전체 강의 보기
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </Link>
              </div>
            </div>
          )}

          {/* ── 코치 목록 드롭다운 ── */}
          <button
            className={`nav-link${isOn("/coaches") ? " on" : ""}`}
            style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", fontFamily: "var(--sans)" }}
            onClick={() => toggleDrop("coaches")}
          >
            코치 목록
            <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"
              style={{ transition: "transform .2s", transform: dropOpen === "coaches" ? "rotate(180deg)" : "none" }}>
              <path d="M6 8L1 3h10z"/>
            </svg>
          </button>

          {dropOpen === "coaches" && (
            <div style={{
              position: "absolute", top: "calc(100% + 14px)", left: 80,
              background: "var(--surface)", border: "1px solid var(--line)",
              borderRadius: "var(--r)", boxShadow: "0 12px 32px rgba(0,0,0,.12)",
              padding: "16px", zIndex: 300, minWidth: 320,
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: "var(--muted)", letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12, padding: "0 4px" }}>
                카테고리별 코치
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/coaches?cat=${cat.id}`}
                    onClick={() => setDropOpen(null)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 10, textDecoration: "none", color: "var(--ink)", transition: "background .12s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "var(--ink)", display: "flex", alignItems: "center",
                      justifyContent: "center", fontSize: 16, color: "var(--accent)",
                    }}>
                      {cat.sym}
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{cat.label}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{cat.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--line)", marginTop: 12, paddingTop: 12 }}>
                <Link
                  href="/coaches"
                  onClick={() => setDropOpen(null)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", borderRadius: 10, textDecoration: "none", color: "var(--muted)", fontSize: 13, fontWeight: 600 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  전체 코치 보기
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>
                </Link>
              </div>
            </div>
          )}

          {/* 기타 링크 */}
          {baseLinks().map((l) => (
            <Link key={l.href} href={l.href} className={`nav-link${isOn(l.href, l.exact) ? " on" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* 우측 */}
        <div className="nav-right">
          {/* Search */}
          <div ref={searchRef} style={{ position: "relative" }}>
            <button className="notif-btn" aria-label="검색" onClick={() => setSearchOpen((o) => !o)}>
              <Icon name="search" size={18} />
            </button>
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "var(--surface)", border: "1px solid var(--line)",
                  borderRadius: "var(--r)", boxShadow: "var(--sh-md)",
                  padding: "10px", zIndex: 300, display: "flex", gap: 8, minWidth: 280,
                }}
              >
                <input
                  autoFocus
                  className="input"
                  placeholder="게임, 강의, 코치 이름 검색"
                  value={searchQ}
                  onChange={(e) => setSearchQ(e.target.value)}
                  style={{ flex: 1, height: 38 }}
                />
                <button type="submit" className="btn btn-accent btn-sm">
                  <Icon name="search" size={14} />
                </button>
              </form>
            )}
          </div>

          {me && (
            <button className="notif-btn" aria-label="알림">
              <Icon name="bell" size={20} />
            </button>
          )}

          {me ? (
            <div ref={menuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
                aria-label="사용자 메뉴"
              >
                <Avatar name={me.nickname || me.address || "U"} idx={0} size={34} />
              </button>

              {menuOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "var(--surface)", border: "1px solid var(--line)",
                  borderRadius: "var(--r)", boxShadow: "0 8px 24px rgba(0,0,0,.10)",
                  minWidth: 200, zIndex: 300, overflow: "hidden",
                }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>
                      {me.nickname || "사용자"}
                    </div>
                    {me.address && (
                      <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--mono)" }}>
                        {me.address.slice(0, 6)}…{me.address.slice(-4)}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "6px 0" }}>
                    {[
                      { href: dashHref,        icon: "user"      as const, label: "내 대시보드"  },
                      { href: "/profile/setup", icon: "settings"  as const, label: "프로필 설정"  },
                      ...(me.is_admin ? [{ href: "/admin", icon: "shieldChk" as const, label: "관리자 패널" }] : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 16px", fontSize: 14,
                          color: item.href === "/admin" ? "var(--warn)" : "var(--ink)",
                          textDecoration: "none", fontWeight: 600,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon name={item.icon} size={15} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid var(--line)", padding: "6px 0" }}>
                    <button
                      onClick={handleLogout}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, width: "100%",
                        padding: "9px 16px", fontSize: 14, color: "var(--danger)",
                        background: "none", border: "none", cursor: "pointer", fontWeight: 600,
                        fontFamily: "var(--sans)",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--danger-tint)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Icon name="logout" size={15} />
                      로그아웃
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="row gap-8">
              <Link href="/auth/login"    className="btn btn-ghost btn-sm">로그인</Link>
              <Link href="/auth/register" className="btn btn-accent btn-sm">회원가입</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
