import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GameCoach",
  description: "1:1 게임 코칭 플랫폼",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="app">{children}</body>
    </html>
  );
}
