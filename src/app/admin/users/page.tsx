"use client";
import React, { useEffect, useState } from "react";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";

interface UserRow {
  id: string;
  nickname: string;
  role: string;
  wallet?: string;
  phone?: string;
  is_admin: number;
  created_at: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async (search = "") => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/users?q=${encodeURIComponent(search)}`);
      const d = await r.json() as { users?: UserRow[] };
      setUsers(d.users ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { const data = d as { users?: UserRow[] } | null; if (data?.users) setUsers(data.users); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const action = async (id: string, act: string) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/users/${id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action: act }),
      });
      await load(q);
    } finally {
      setActionId(null);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/admin/users/${id}`, { method:"DELETE" });
    await load(q);
  };

  const ROLE_MAP: Record<string, string> = {
    student:"수강생", coach:"코치", both:"코치+수강생", admin:"관리자"
  };

  return (
    <>
      <div className="spread" style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900 }}>회원 관리</h1>
        <div className="row gap-10">
          <div style={{ position:"relative" }}>
            <Icon name="search" size={15} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"var(--muted)" }} />
            <input
              className="input"
              placeholder="닉네임, 지갑, 전화번호 검색"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load(q)}
              style={{ paddingLeft:32, minWidth:260 }}
            />
          </div>
          <button className="btn btn-outline btn-sm" onClick={() => load(q)}>검색</button>
        </div>
      </div>

      <div className="card" style={{ overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid var(--line)", background:"var(--sunken)" }}>
              {["회원", "역할", "지갑", "가입일", "액션"].map((h) => (
                <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:12, fontWeight:700, color:"var(--muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding:"40px", textAlign:"center", color:"var(--muted)" }}>로딩 중...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} style={{ padding:"40px", textAlign:"center", color:"var(--muted)" }}>회원이 없습니다</td></tr>
            ) : users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: i < users.length-1 ? "1px solid var(--line)" : "none" }}>
                <td style={{ padding:"12px 16px" }}>
                  <div className="row gap-10">
                    <Avatar name={u.nickname || "?"} idx={0} size={32} />
                    <div>
                      <div style={{ fontWeight:700, fontSize:14 }}>
                        {u.nickname || "(닉네임 없음)"}
                        {u.is_admin === 1 && (
                          <span style={{ marginLeft:6, fontSize:10, background:"var(--danger)", color:"#fff", borderRadius:4, padding:"1px 5px" }}>ADMIN</span>
                        )}
                      </div>
                      <div style={{ fontSize:11, color:"var(--muted)" }}>{u.id.slice(0,8)}…</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <span className="badge">{ROLE_MAP[u.role] ?? u.role}</span>
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, fontFamily:"var(--mono)", color:"var(--muted)" }}>
                  {u.wallet ? `${u.wallet.slice(0,6)}…${u.wallet.slice(-4)}` : "-"}
                </td>
                <td style={{ padding:"12px 16px", fontSize:12, color:"var(--muted)" }}>
                  {new Date(u.created_at * 1000).toLocaleDateString("ko")}
                </td>
                <td style={{ padding:"12px 16px" }}>
                  <div className="row gap-6">
                    {u.is_admin === 0 ? (
                      <button
                        className="btn btn-outline btn-xs"
                        disabled={actionId === u.id}
                        onClick={() => action(u.id, "promote_admin")}
                      >
                        관리자 지정
                      </button>
                    ) : (
                      <button
                        className="btn btn-outline btn-xs"
                        disabled={actionId === u.id}
                        onClick={() => action(u.id, "demote_admin")}
                      >
                        관리자 해제
                      </button>
                    )}
                    <button
                      className="btn btn-xs"
                      style={{ background:"var(--danger-tint)", color:"var(--danger)", border:"none" }}
                      disabled={actionId === u.id}
                      onClick={() => deleteUser(u.id)}
                    >
                      삭제
                    </button>
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
