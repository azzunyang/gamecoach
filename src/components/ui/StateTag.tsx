const STATE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING:   { label: "승인 대기", color: "var(--yellow)",   bg: "var(--yellow-lt)" },
  ACCEPTED:  { label: "수락됨",   color: "var(--primary)",  bg: "var(--primary-lt)" },
  ACTIVE:    { label: "진행중",   color: "var(--green)",    bg: "var(--green-lt)" },
  COMPLETED: { label: "완료",     color: "var(--muted)",    bg: "var(--bg)" },
  REJECTED:  { label: "거절됨",   color: "var(--red)",      bg: "var(--red-lt)" },
  CANCELLED: { label: "취소됨",   color: "var(--muted)",    bg: "var(--bg)" },
  DISPUTED:  { label: "분쟁중",   color: "var(--red)",      bg: "var(--red-lt)" },
  RESOLVED:  { label: "해결됨",   color: "var(--green)",    bg: "var(--green-lt)" },
};

export default function StateTag({ state }: { state: string }) {
  const s = STATE_MAP[state] ?? { label: state, color: "var(--muted)", bg: "var(--bg)" };
  return (
    <span style={{ fontSize: 12, fontWeight: 700, color: s.color, background: s.bg, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}
