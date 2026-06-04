"use client";
import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import LectureThumbnail from "@/components/LectureThumbnail";

interface Lecture {
  id: string;
  title: string;
  game: string;
  game_category: string;
  price_eth: string;
  duration: number;
  level: string;
  is_published: number;
  created_at: number;
}

interface Me { id: string }

export default function CoachLecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (coachId: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/lectures?coach_id=${coachId}&is_mine=1`);
      const d = await r.json() as { lectures?: Lecture[] };
      setLectures(d.lectures ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const m = d as Me | null;
        if (m?.id) { setMe(m); load(m.id); }
      })
      .catch(() => {});
  }, [load]);

  const togglePublish = async (lec: Lecture) => {
    await fetch(`/api/lectures/${lec.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_published: lec.is_published ? 0 : 1 }),
    });
    if (me) load(me.id);
  };

  const deleteLecture = async (id: string) => {
    if (!confirm("강의를 삭제하시겠습니까?")) return;
    await fetch(`/api/lectures/${id}`, { method: "DELETE" });
    if (me) load(me.id);
  };

  return (
    <>
      <TopNav />
      <main className="page">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/dashboard/coach" className="btn btn-ghost btn-sm" style={{ marginBottom: 16, display: "inline-flex" }}>
            <Icon name="chevL" size={14} />
            대시보드로
          </Link>
          <div className="spread">
            <div>
              <p className="eyebrow" style={{ marginBottom: 4 }}>코치 대시보드</p>
              <h1 className="h2">내 강의 관리</h1>
            </div>
            <Link href="/dashboard/coach/lectures/new" className="btn btn-accent btn-sm">
              <Icon name="plus" size={15} />
              새 강의 등록
            </Link>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px", color: "var(--muted)" }}>
            <span className="spin" style={{ display: "inline-block" }} />
          </div>
        ) : lectures.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: "center", padding: "60px 20px" }}>
            <Icon name="book" size={40} style={{ margin: "0 auto 16px", display: "block", color: "var(--muted)" }} />
            <div style={{ fontWeight: 700, marginBottom: 8, fontSize: 16 }}>등록된 강의가 없어요</div>
            <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 24 }}>첫 강의를 등록하고 수강생을 만나보세요</p>
            <Link href="/dashboard/coach/lectures/new" className="btn btn-accent" style={{ display: "inline-flex" }}>
              <Icon name="plus" size={15} />
              강의 등록하기
            </Link>
          </div>
        ) : (
          <div className="col gap-14">
            {lectures.map((lec) => (
              <div key={lec.id} className="card" style={{ overflow: "hidden" }}>
                <LectureThumbnail
                  game={lec.game}
                  title={lec.title}
                  level={lec.level}
                  price={lec.price_eth}
                  duration={lec.duration}
                  height={140}
                />
                <div className="spread" style={{ padding: "12px 16px" }}>
                  <div className="row gap-8">
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      color: lec.is_published ? "var(--success)" : "var(--muted)",
                    }}>
                      {lec.is_published ? "● 공개중" : "○ 비공개"}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      {lec.duration}분 · {lec.price_eth} ETH
                    </span>
                  </div>
                  <div className="row gap-8">
                    <button className="btn btn-outline btn-sm" onClick={() => togglePublish(lec)}>
                      {lec.is_published ? "비공개로" : "공개하기"}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ background: "var(--danger-tint)", color: "var(--danger)", border: "none" }}
                      onClick={() => deleteLecture(lec.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
