"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

interface Lesson {
  id: string;
  coach: string;
  coachAvi: number;
  student: string;
  studentAvi: number;
  game: string;
  slot: string;
  state: string;
}

interface Me { id: string; role: string; nickname?: string }

const STATE_LABEL: Record<string, string> = {
  PENDING: '승인 대기', ACCEPTED: '수락됨', ACTIVE: '진행중',
  COMPLETED: '완료', REJECTED: '거절됨', CANCELLED: '취소됨',
};

const STATE_CLS: Record<string, string> = {
  PENDING: 'st-pending', ACCEPTED: 'st-accepted', ACTIVE: 'st-progress',
  COMPLETED: 'st-done', REJECTED: 'st-rejected', CANCELLED: 'st-rejected',
};

export default function ChatInboxPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        const m = d as Me | null;
        if (!m?.id) { router.push("/auth/login"); return; }
        setMe(m);
        return fetch("/api/lessons");
      })
      .then((r) => r?.ok ? r.json() : null)
      .then((d) => {
        const data = d as { lessons?: Lesson[] } | null;
        if (data?.lessons) setLessons(data.lessons);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  // 채팅 가능한 수업만 (ACCEPTED, ACTIVE)
  const chatableLessons = lessons.filter((l) => ['ACCEPTED', 'ACTIVE'].includes(l.state));
  const otherLessons = lessons.filter((l) => !['ACCEPTED', 'ACTIVE'].includes(l.state));

  return (
    <>
      <TopNav />
      <main className="page">
        <div style={{ marginBottom: 28 }}>
          <p className="eyebrow" style={{ marginBottom: 4 }}>메시지</p>
          <h1 className="h2">채팅 목록</h1>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--muted)' }}>
            <span className="spin" style={{ display: 'inline-block' }} />
          </div>
        ) : lessons.length === 0 ? (
          <div className="card card-pad" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Icon name="chat" size={40} style={{ margin: '0 auto 16px', display: 'block', color: 'var(--muted)' }} />
            <div style={{ fontWeight: 700, marginBottom: 8 }}>진행 중인 수업이 없어요</div>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 20 }}>
              수업이 수락되면 코치와 채팅할 수 있어요
            </p>
            <Link href="/coaches" className="btn btn-accent btn-sm" style={{ display: 'inline-flex' }}>
              <Icon name="compass" size={14} />
              코치 찾기
            </Link>
          </div>
        ) : (
          <div className="col gap-24">
            {/* 채팅 가능한 수업 */}
            {chatableLessons.length > 0 && (
              <div>
                <h2 className="h3" style={{ marginBottom: 14 }}>
                  채팅 가능
                  <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 500, marginLeft: 8 }}>{chatableLessons.length}건</span>
                </h2>
                <div className="col gap-10">
                  {chatableLessons.map((l) => {
                    const other = me?.role === 'coach' ? l.student : l.coach;
                    const otherAvi = me?.role === 'coach' ? l.studentAvi : l.coachAvi;
                    return (
                      <Link
                        key={l.id}
                        href={`/chat/${l.id}`}
                        className="card card-pad hover-lift"
                        style={{ display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}
                      >
                        <div style={{ position: 'relative', flexShrink: 0 }}>
                          <Avatar name={other} idx={otherAvi ?? 0} size={46} />
                          <span style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 12, height: 12, borderRadius: '50%',
                            background: 'var(--success)', border: '2px solid var(--surface)',
                          }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                            {other}{me?.role === 'student' ? ' 코치' : ''}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {l.game} · {l.slot}
                          </div>
                        </div>
                        <div className="col gap-6" style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                          <span className={`status ${STATE_CLS[l.state] ?? ''}`}>{STATE_LABEL[l.state] ?? l.state}</span>
                          <Icon name="chevR" size={14} style={{ color: 'var(--faint)' }} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 기타 수업 */}
            {otherLessons.length > 0 && (
              <div>
                <h2 className="h3" style={{ marginBottom: 14, color: 'var(--muted)' }}>
                  기타 수업
                </h2>
                <div className="col gap-10">
                  {otherLessons.map((l) => {
                    const other = me?.role === 'coach' ? l.student : l.coach;
                    const otherAvi = me?.role === 'coach' ? l.studentAvi : l.coachAvi;
                    return (
                      <div
                        key={l.id}
                        className="card card-pad"
                        style={{ display: 'flex', gap: 14, alignItems: 'center', opacity: 0.65 }}
                      >
                        <Avatar name={other} idx={otherAvi ?? 0} size={46} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 3 }}>
                            {other}{me?.role === 'student' ? ' 코치' : ''}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                            {l.game} · {l.slot}
                          </div>
                        </div>
                        <span className={`status ${STATE_CLS[l.state] ?? ''}`}>{STATE_LABEL[l.state] ?? l.state}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <BottomNav />
    </>
  );
}
