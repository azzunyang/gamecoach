"use client";
import React, { useEffect, useState } from "react";
import Icon from "@/components/Icon";

interface ReportRow {
  id: string;
  reporter_id: string;
  reporter_nickname: string;
  target_id: string;
  target_nickname: string;
  reason: string;
  detail?: string;
  created_at: number;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [status, setStatus] = useState("pending");
  const [actionId, setActionId] = useState<string | null>(null);

  const load = async (s = "pending") => {
    const r = await fetch(`/api/admin/reports?status=${s}`);
    const d = await r.json() as { reports?: ReportRow[] };
    setReports(d.reports ?? []);
  };

  useEffect(() => {
    fetch("/api/admin/reports?status=pending")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { const data = d as { reports?: ReportRow[] } | null; if (data?.reports) setReports(data.reports); })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolve = async (id: string, act?: string) => {
    setActionId(id);
    try {
      await fetch(`/api/admin/reports/${id}`, {
        method:"PATCH",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ action: act }),
      });
      await load(status);
    } finally {
      setActionId(null);
    }
  };

  return (
    <>
      <div className="spread" style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:22, fontWeight:900 }}>신고 관리</h1>
        <div className="seg">
          {[{val:"pending",label:"미처리"},{val:"resolved",label:"처리완료"}].map((s) => (
            <button key={s.val} className={status===s.val?"on":""} onClick={() => { setStatus(s.val); load(s.val); }}>{s.label}</button>
          ))}
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="card card-pad" style={{ textAlign:"center", padding:"60px", color:"var(--muted)" }}>
          <Icon name="check" size={32} style={{ margin:"0 auto 12px", display:"block", color:"var(--success)" }} />
          <div style={{ fontWeight:700 }}>신고 내역이 없습니다</div>
        </div>
      ) : (
        <div className="col gap-14">
          {reports.map((r) => (
            <div key={r.id} className="card card-pad">
              <div className="spread" style={{ marginBottom:12 }}>
                <div className="row gap-10">
                  <div style={{ width:36, height:36, borderRadius:"50%", background:"var(--danger-tint)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Icon name="flag" size={16} style={{ color:"var(--danger)" }} />
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>
                      <span style={{ color:"var(--ink)" }}>{r.reporter_nickname}</span>
                      <span style={{ color:"var(--muted)", margin:"0 6px" }}>→</span>
                      <span style={{ color:"var(--danger)" }}>{r.target_nickname}</span>
                    </div>
                    <div style={{ fontSize:12, color:"var(--muted)" }}>
                      {new Date(r.created_at * 1000).toLocaleString("ko")}
                    </div>
                  </div>
                </div>
                {r.detail === "resolved" && (
                  <span style={{ fontSize:12, background:"var(--success-tint)", color:"var(--success)", borderRadius:"var(--r-xs)", padding:"3px 8px", fontWeight:700 }}>처리완료</span>
                )}
              </div>

              <div style={{ background:"var(--sunken)", borderRadius:"var(--r-sm)", padding:"12px 14px", marginBottom:12 }}>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--muted)", marginBottom:4 }}>신고 사유</div>
                <div style={{ fontSize:14 }}>{r.reason}</div>
              </div>

              {r.detail !== "resolved" && (
                <div className="row gap-8">
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={actionId === r.id}
                    onClick={() => resolve(r.id)}
                  >
                    신고만 처리
                  </button>
                  <button
                    className="btn btn-sm"
                    style={{ background:"var(--success-tint)", color:"var(--success)", border:"none" }}
                    disabled={actionId === r.id}
                    onClick={() => resolve(r.id, "verify_tier")}
                  >
                    <Icon name="shieldChk" size={13} />
                    티어 인증으로 처리
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
