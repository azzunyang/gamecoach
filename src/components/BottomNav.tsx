"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "./Icon";

interface Me {
  role: "student" | "instructor" | null;
}

const studentTabs = [
  { label: "둘러보기", href: "/coaches", icon: "compass" as const },
  { label: "내수업", href: "/dashboard/student", icon: "book" as const },
  { label: "메시지", href: "/chat", icon: "chat" as const },
  { label: "MY", href: "/profile/setup", icon: "user" as const },
];

const coachTabs = [
  { label: "대시보드", href: "/dashboard/coach", icon: "home" as const },
  { label: "요청", href: "/dashboard/coach?tab=requests", icon: "users" as const },
  { label: "수익", href: "/dashboard/coach?tab=earnings", icon: "coin" as const },
  { label: "프로필", href: "/dashboard/coach?tab=profile", icon: "user" as const },
];

const defaultTabs = [
  { label: "홈", href: "/", icon: "home" as const },
  { label: "코치", href: "/coaches", icon: "compass" as const },
  { label: "로그인", href: "/auth/login", icon: "user" as const },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<"student" | "instructor" | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const d = data as Me | null;
        if (d?.role) setRole(d.role);
      })
      .catch(() => {});
  }, []);

  const tabs = role === "instructor" ? coachTabs : role === "student" ? studentTabs : defaultTabs;

  const isOn = (href: string) => {
    const base = href.split("?")[0];
    if (base === "/") return pathname === "/";
    return pathname.startsWith(base);
  };

  return (
    <div className="tabbar">
      {tabs.map((t) => (
        <Link key={t.href} href={t.href} className={`tab${isOn(t.href) ? " on" : ""}`}>
          <Icon name={t.icon} size={22} sw={isOn(t.href) ? 2.5 : 2} />
          {t.label}
        </Link>
      ))}
    </div>
  );
}
