"use client";
import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "./Icon";
import Avatar from "./Avatar";

interface Me {
  id: string;
  address: string;
  role: "student" | "coach" | null;
  nickname?: string;
}

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddr, setWalletAddr] = useState("");
  const [walletEth] = useState("0.41");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const d = data as Me | null;
        if (d?.id) {
          setMe(d);
          if (d.address) {
            setWalletConnected(true);
            setWalletAddr(d.address);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleLogout = async () => {
    setMenuOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    setWalletConnected(false);
    setWalletAddr("");
    router.push("/");
    router.refresh();
  };

  const isOn = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const navLinks = () => {
    if (!me) {
      return [
        { label: "코치 찾기", href: "/coaches" },
        { label: "코치 되기", href: "/auth/register" },
      ];
    }
    if (me.role === "student") {
      return [
        { label: "둘러보기", href: "/coaches" },
        { label: "내 수업", href: "/dashboard/student" },
        { label: "메시지", href: "/chat" },
      ];
    }
    if (me.role === "coach") {
      return [
        { label: "대시보드", href: "/dashboard/coach" },
        { label: "수익", href: "/dashboard/coach?tab=earnings" },
        { label: "프로필", href: "/dashboard/coach?tab=profile" },
      ];
    }
    return [];
  };

  const short = walletAddr
    ? `${walletAddr.slice(0, 6)}…${walletAddr.slice(-4)}`
    : "";

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
              className={`nav-link${isOn(l.href) ? " on" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          {me && (
            <button className="notif-btn" aria-label="알림">
              <Icon name="bell" size={20} />
            </button>
          )}

          {walletConnected ? (
            <div className="wallet">
              <span className="dot" />
              <span className="mono">{short} · {walletEth} ETH</span>
            </div>
          ) : (
            <button className="wallet btn" onClick={() => {}}>
              <Icon name="wallet" size={15} />
              지갑 연결
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
                  {/* User info */}
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

                  {/* Menu items */}
                  <div style={{ padding: "6px 0" }}>
                    <Link
                      href={dashHref}
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 16px", fontSize: 14, color: "var(--ink)",
                        textDecoration: "none", fontWeight: 600,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Icon name="user" size={15} />
                      내 대시보드
                    </Link>
                    <Link
                      href="/profile/setup"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 16px", fontSize: 14, color: "var(--ink)",
                        textDecoration: "none", fontWeight: 600,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--sunken)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Icon name="settings" size={15} />
                      프로필 설정
                    </Link>
                  </div>

                  {/* Logout */}
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
