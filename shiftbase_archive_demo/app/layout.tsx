import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shiftbase — AI 업무전환 학습",
  description:
    "당신의 일에 AI라는 날개를 달아주는 AX 학습 플랫폼입니다.",
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="font-sans">{children}</body>
    </html>
  );
}
