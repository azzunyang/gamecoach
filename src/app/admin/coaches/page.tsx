"use client";
import React, { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";

interface CoachRow {
  id: string;
  nickname: string;
  game_category: string;
  tier: string;
  tier_self: number;
  is_published: number;
  avg_rating: number;
  review_count: number;
  created_at: number;
  wallet?: string;
}

export default function AdminCoachesPage() {
  const [coaches, setCoaches] = useState<CoachRow[]>([]);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async (search = "", f = "all") => {
    const verified = f === "unverified" ? "0" : f === "verified" ? "1" : "";
    const r = await fetch(`/api/admin/coaches?q=${encodeURIComponent(search)}${verified ? "&verified="+verified : ""}`);
    const d = await r.json() as { coaches?: CoachRow[] };
    setCoaches(d.coaches ?? []);
  };

  useEffect(() => {
    fetch("/api/admin/coaches")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { const data = d as { coaches?: CoachRow[] } | null; if (data?.coaches) setCoaches(data.coaches); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const action = async (id: string, act: string, tier?: string) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/coaches/${id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action: act, ...(tier ? { tier } : {}) }),
      });
      await load(q, filter);
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <div className="spread" style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900 }}>코치 관리</h1>
        <div className="row gap-10">
          <div className="seg">
            {[{val:"all",label:"전체"},{val:"unverified",label:"미인증"},{val:"verified",label:"인증완료"}].map((s) => (
              <button key={s.val} className={filter===s.val?"on":""} onClick={() => { setFilter(s.val); load(q, s.val); }}>{s.label}</button>
            ))}
          </div>
          <div style={{ position:"relative" }}>
            <Icon name="search" size={15} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} />
            <input
              className="input"
              placeholder="닉네임, 카테고리 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(q, filter)}
              style={{ paddingLeft:32, minWidth:220 }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid var(--line)", background:"var(--sunken)" }}>
              {["코치", "카테고리", "티어", "별점", "공개", "액션"].map((h) => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {coaches.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:"40px", textAlign:"center", color:"var(--muted)" }}>코치가 없습니다</td></tr>
            ) : coaches.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < coaches.length-1 ? "1px solid var(--line)" : "none" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div className="row gap-10">
                    <Avatar name={c.nickname} idx={0} size={32} />
                    <div style={{ fontWeight:700, fontSize:14 }}>{c.nickname}</div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span className="badge">{c.game_category}</span>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <div className="row gap-6">
                    <span className="badge b-tier">{c.tier || "-"}</span>
                    {c.tier_self === 1 ? (
                      <span style={{ fontSize:11, color:"var(--warn)", background:"var(--warn-tint)", borderRadius:4, padding:"1px 6px" }}>미인증</span>
                    ) : (
                      <Icon name="shieldChk" size={13} style={{ color:"var(--success)" }} />
                    )}
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <div className="row gap-4">
                    <Icon name="star" size={13} fill style={{ color:"#F5A623" }} />
                    <span style={{ fontSize:13, fontWeight:700 }}>{c.avg_rating.toFixed(1)}</span>
                    <span style={{ fontSize:12, color:"var(--muted)" }}>({c.review_count})</span>
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span style={{ fontSize:12, color: c.is_published ? "var(--success)" : "var(--muted)" }}>
                    {c.is_published ? "공개" : "비공개"}
                  </span>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <div className="row gap-6">
                    {c.tier_self === 1 && (
                      <button
                        className="btn btn-outline btn-xs"
                        disabled={actionId === c.id}
                        onClick={() => action(c.id, "verify_tier")}
                      >
                        티어 인증
                      </button>
                    )}
                    {c.is_published ? (
                      <button
                        className="btn btn-xs"
                        style={{ background:"var(--danger-tint)", color:"var(--danger)", border:"none" }}
                        disabled={actionId === c.id}
                        onClick={() => action(c.id, "suspend")}
                      >
                        정지
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline btn-xs"
                        disabled={actionId === c.id}
                        onClick={() => action(c.id, "unsuspend")}
                      >
                        복구
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
