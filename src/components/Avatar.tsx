"use client";
import React from "react";

const AV_COLORS = [
  '#E0563B','#3B82C4','#7C5CD0','#1E9E54',
  '#D98A12','#C0408A','#2BA39A','#5A6270',
];

interface AvatarProps {
  name: string;
  idx?: number;
  size?: number;
  square?: boolean;
  online?: boolean;
}

export default function Avatar({ name, idx = 0, size = 44, square = false, online }: AvatarProps) {
  const bg = AV_COLORS[Math.abs(idx) % AV_COLORS.length];
  const safeName = name || "?";
  const initials = safeName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div style={{ position: "relative", display: "inline-flex", flexShrink: 0 }}>
      <div
        className={`avatar${square ? " sq" : ""}`}
        style={{
          width: size,
          height: size,
          background: bg,
          fontSize: size * 0.38,
        }}
      >
        {initials}
      </div>
      {online && (
        <span
          style={{
            position: "absolute",
            bottom: 1,
            right: 1,
            width: Math.max(9, size * 0.22),
            height: Math.max(9, size * 0.22),
            borderRadius: "50%",
            background: "var(--success)",
            border: "2px solid var(--surface)",
          }}
        />
      )}
    </div>
  );
}
