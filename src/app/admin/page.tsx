"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/Icon";

interface Stats {
  users: number;
  coaches: number;
  lessons: number;
  pending_reports: number;
  lectures: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { if (d) setStats(d as Stats); })
      .catch(() => {});
  }, []);

  const cards = [
    { icon:"users" as const, label:"전체 회원", val:stats?.users ?? "-", cls:"" },
    { icon:"trophy" as const, label:"코치 수", val:stats?.coaches ?? "-", cls:"accent" },
    { icon:"book" as const, label:"공개 강의", val:stats?.lectures ?? "-", cls:"green" },
    { icon:"calendar" as const, label:"전체 수업", val:stats?.lessons ?? "-", cls:"" },
    { icon:"flag" as const, label:"미처리 신고", val:stats?.pending_reports ?? "-", cls:"warn" },
  ];

  return (
    <>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:24, fontWeight:900, marginBottom:6 }}>관리자 대시보드</h1>
        <p style={{ color:"var(--muted)", fontSize:14 }}>플랫폼 전반 현황을 확인하세요</p>
      </div>

      <div className="grid-3 gap-16" style={{ marginBottom:32 }}>
        {cards.map((c) => (
          <div key={c.label} className="card card-pad row gap-14">
            <div className={`dash-ic${c.cls ? " "+c.cls : ""}`}>
              <Icon name={c.icon} size={22} />
            </div>
            <div>
              <div style={{ fontSize:26, fontWeight:900, fontFamily:"var(--mono)" }}>{c.val}</div>
              <div style={{ fontSize:12, color:"var(--muted)" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="notice info" style={{ marginTop:8 }}>
        <Icon name="info" size={14} style={{ display:"inline", marginRight:6 }} />
        좌측 메뉴에서 회원·코치·신고를 관리할 수 있습니다.
      </div>
    </>
  );
}
