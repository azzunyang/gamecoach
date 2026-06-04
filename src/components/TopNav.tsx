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

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const d = data as Me | null;
        if (d?.id) setMe(d);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
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

  const navLinks = () => {
    if (!me) {
      return [
        { label: "코치 찾기", href: "/coaches", exact: false },
        { label: "코치 되기", href: "/auth/register", exact: false },
      ];
    }
    if (me.role === "student") {
      return [
        { label: "둘러보기", href: "/coaches", exact: false },
        { label: "내 수업", href: "/dashboard/student", exact: true },
        { label: "메시지", href: "/chat", exact: false },
      ];
    }
    if (me.role === "coach") {
      return [
        { label: "대시보드", href: "/dashboard/coach", exact: true },
        { label: "강의 관리", href: "/dashboard/coach/lectures", exact: false },
        { label: "수익", href: "/dashboard/coach?tab=earnings", exact: false },
      ];
    }
    return [] as { label: string; href: string; exact: boolean }[];
  };

  const dashHref = me?.role === "coach" ? "/dashboard/coach" : "/dashboard/student";

  return (
    <nav className="topnav">
      <div className="topnav-in">
        <Link href="/" className="brand">
          <div className="brand-ic">G</div>
          GameCoach
        </Link>

        <div className="nav-links">
          {navLinks().map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link${isOn(l.href, l.exact) ? " on" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          {/* Search */}
          <div ref={searchRef} style={{ position: "relative" }}>
            <button
              className="notif-btn"
              aria-label="검색"
              onClick={() => setSearchOpen((o) => !o)}
            >
              <Icon name="search" size={18} />
            </button>
            {searchOpen && (
              <form
                onSubmit={handleSearch}
                style={{
                  position: "absolute", top: "calc(100% + 10px)", right: 0,
                  background: "var(--surface)", border: "1px solid var(--line)",
                  borderRadius: "var(--r)", boxShadow: "var(--sh-md)",
                  padding: "10px", zIndex: 200, display: "flex", gap: 8, minWidth: 280,
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
                  minWidth: 200, zIndex: 200, overflow: "hidden",
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
                      { href: dashHref, icon: "user" as const, label: "내 대시보드" },
                      { href: "/profile/setup", icon: "settings" as const, label: "프로필 설정" },
                      ...(me.is_admin ? [{ href: "/admin", icon: "shieldChk" as const, label: "관리자 패널" }] : []),
                    ].map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMenuOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          padding: "9px 16px", fontSize: 14, color: item.href === "/admin" ? "var(--warn)" : "var(--ink)",
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
              <Link href="/auth/login" className="btn btn-ghost btn-sm">
                로그인
              </Link>
              <Link href="/auth/register" className="btn btn-accent btn-sm">
                회원가입
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
