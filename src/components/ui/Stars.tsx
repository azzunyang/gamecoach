export default function Stars({ n, size = 14 }: { n: number; size?: number }) {
  const full = Math.round(n);
  return (
    <span style={{ color: "var(--yellow)", fontSize: size, lineHeight: 1 }}>
      {"★".repeat(Math.min(full, 5))}{"☆".repeat(Math.max(0, 5 - full))}
    </span>
  );
}
