"use client";
export const runtime = "edge";
import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import TopNav from "@/components/TopNav";
import Icon from "@/components/Icon";
import Avatar from "@/components/Avatar";

const MOCK_LESSON = {
  id: "l3",
  coach: "FrostQueen",
  coachAvi: 5,
  game: "Overwatch 2",
  slot: "2026-05-20",
  session: 60,
};

const TAGS = [
  '설명이명확', '친절', '시간준수',
  '실력향상체감', '알찬구성', '콜이정확',
];

const TAG_LABELS: Record<string, string> = {
  '설명이명확': '설명이 명확해요',
  '친절': '친절해요',
  '시간준수': '시간을 잘 지켜요',
  '실력향상체감': '실력이 늘었어요',
  '알찬구성': '알찬 구성이에요',
  '콜이정확': '콜이 정확해요',
};

const STAR_LABELS = ['', '별로예요', '아쉬워요', '보통이에요', '좋아요', '최고예요'];

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div>
      <div className="row gap-4" style={{ marginBottom:6 }}>
        {[1,2,3,4,5].map((n) => (
          <button
            key={n}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(n)}
            style={{ background:'none', border:'none', cursor:'pointer', fontSize:36, lineHeight:1, padding:2, transition:'transform .1s', transform: n <= (hover||value) ? 'scale(1.1)' : 'scale(1)' }}
          >
            <Icon
              name="star"
              size={32}
              fill
              style={{ color: n <= (hover||value) ? '#F5A623' : 'var(--line-strong)' }}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <div style={{ fontSize:14, fontWeight:700, color:'var(--muted)' }}>{STAR_LABELS[hover||value]}</div>
      )}
    </div>
  );
}

export default function ReviewPage() {
  const params = useParams();
  const lessonId = params?.lessonId as string;
  const [rating, setRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag: string) => {
    setSelectedTags((p) => p.includes(tag) ? p.filter((t) => t !== tag) : [...p, tag]);
  };

  const submit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lesson_id: lessonId ?? MOCK_LESSON.id,
          rating,
          tags: selectedTags,
          body,
        }),
      });
    } catch {}
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <>
        <TopNav />
        <main style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:'calc(var(--nav-h) + 20px) 20px 60px' }}>
          <div className="card card-pad" style={{ maxWidth:400, width:'100%', textAlign:'center', padding:48 }}>
            <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--success-tint)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Icon name="star" size={30} fill style={{ color:'#F5A623' }} />
            </div>
            <h1 style={{ fontSize:20, fontWeight:900, marginBottom:8 }}>리뷰 작성 완료!</h1>
            <p style={{ fontSize:14, color:'var(--muted)', marginBottom:24 }}>
              소중한 후기가 등록되었습니다.<br />다른 수강생들에게 큰 도움이 됩니다.
            </p>
            <Link href="/dashboard/student" className="btn btn-primary btn-lg btn-block">
              대시보드로 돌아가기
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <main className="page" style={{ maxWidth:600 }}>
        <Link href="/dashboard/student" className="btn btn-ghost btn-sm" style={{ marginBottom:20, display:'inline-flex' }}>
          <Icon name="chevL" size={14} />
          대시보드
        </Link>

        <h1 className="h2" style={{ marginBottom:24 }}>수업 리뷰 작성</h1>

        {/* Coach summary */}
        <div className="card card-pad row gap-14" style={{ marginBottom:24 }}>
          <Avatar name={MOCK_LESSON.coach} idx={MOCK_LESSON.coachAvi} size={48} />
          <div>
            <div style={{ fontWeight:800, fontSize:16 }}>{MOCK_LESSON.coach} 코치</div>
            <div style={{ fontSize:13, color:'var(--muted)', marginTop:3 }}>
              {MOCK_LESSON.game} · {MOCK_LESSON.slot} · {MOCK_LESSON.session}분 세션
            </div>
          </div>
          <span className="status st-done" style={{ marginLeft:'auto' }}>완료</span>
        </div>

        {/* Star rating */}
        <div className="card card-pad" style={{ marginBottom:16 }}>
          <h2 className="h3" style={{ marginBottom:16 }}>전체 평점</h2>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        {/* Tag chips */}
        <div className="card card-pad" style={{ marginBottom:16 }}>
          <h2 className="h3" style={{ marginBottom:12 }}>어떤 점이 좋았나요? <span style={{ fontSize:14, color:'var(--muted)', fontWeight:400 }}>(선택)</span></h2>
          <div className="row wrap gap-8">
            {TAGS.map((tag) => (
              <button
                key={tag}
                className={`chip${selectedTags.includes(tag) ? ' on accent' : ''}`}
                onClick={() => toggleTag(tag)}
              >
                {selectedTags.includes(tag) && <Icon name="check" size={12} />}
                {TAG_LABELS[tag]}
              </button>
            ))}
          </div>
        </div>

        {/* Review body */}
        <div className="card card-pad" style={{ marginBottom:24 }}>
          <h2 className="h3" style={{ marginBottom:12 }}>
            후기 작성 <span style={{ fontSize:14, color:'var(--muted)', fontWeight:400 }}>(선택)</span>
          </h2>
          <textarea
            className="textarea"
            placeholder="수업 경험을 자유롭게 작성해 주세요. 다른 수강생들에게 큰 도움이 됩니다."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            style={{ minHeight:120 }}
          />
          <div className="hint" style={{ textAlign:'right', marginTop:4 }}>{body.length}/500</div>
        </div>

        {rating === 0 && (
          <div className="notice warn" style={{ marginBottom:16 }}>
            <Icon name="warn" size={14} style={{ display:'inline', marginRight:6 }} />
            별점을 선택해야 리뷰를 등록할 수 있어요
          </div>
        )}

        <button
          className="btn btn-accent btn-lg btn-block"
          onClick={submit}
          disabled={rating === 0 || loading}
        >
          {loading ? <span className="spin" /> : <Icon name="star" size={18} fill />}
          리뷰 등록하기
        </button>
      </main>
    </>
  );
}
