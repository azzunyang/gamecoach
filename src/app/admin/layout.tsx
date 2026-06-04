"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Icon from "@/components/Icon";

interface Me { id: string; is_admin?: number }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const me = d as Me | null;
        if (!me?.is_admin) router.replace("/");
        else setChecked(true);
      })
      .catch(() => router.replace("/"));
  }, [router]);

  if (!checked) {
    return (
      <div style={{ minHeight:"100dvh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <span className="spin" />
      </div>
    );
  }

  const nav = [
    { href:"/admin", label:"대시보드", icon:"compass" as const, exact:true },
    { href:"/admin/users", label:"회원 관리", icon:"users" as const },
    { href:"/admin/coaches", label:"코치 관리", icon:"trophy" as const },
    { href:"/admin/reports", label:"신고 관리", icon:"flag" as const },
  ];

  const isOn = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div style={{ display:"flex", minHeight:"100dvh" }}>
      {/* Sidebar */}
      <aside style={{
        width:220, flexShrink:0, background:"var(--surface)",
        borderRight:"1px solid var(--line)", padding:"24px 0",
        position:"fixed", top:0, left:0, bottom:0, overflowY:"auto",
      }}>
        <div style={{ padding:"0 20px 24px", borderBottom:"1px solid var(--line)" }}>
          <div style={{ fontWeight:900, fontSize:16 }}>GameCoach</div>
          <div style={{ fontSize:12, color:"var(--muted)", marginTop:2 }}>관리자 패널</div>
        </div>
        <nav style={{ padding:"12px 10px", display:"flex", flexDirection:"column", gap:2 }}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
                borderRadius:"var(--r-sm)", fontSize:14, fontWeight:600,
                color: isOn(item.href, item.exact) ? "var(--ink)" : "var(--muted)",
                background: isOn(item.href, item.exact) ? "var(--sunken)" : "transparent",
                textDecoration:"none",
              }}
            >
              <Icon name={item.icon} size={16} />
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ position:"absolute", bottom:20, left:0, right:0, padding:"0 10px" }}>
          <Link
            href="/"
            style={{
              display:"flex", alignItems:"center", gap:10, padding:"9px 12px",
              borderRadius:"var(--r-sm)", fontSize:14, color:"var(--muted)",
              textDecoration:"none",
            }}
          >
            <Icon name="chevL" size={14} />
            사이트로 돌아가기
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft:220, flex:1, padding:32, background:"var(--paper)" }}>
        {children}
      </main>
    </div>
  );
}
