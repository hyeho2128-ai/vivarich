import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VIVA RICH | 우리 모임 일정판",
  description: "8명이 함께 쓰는 일정과 네이버 카페 인증글 체크 보드",
  icons: {
    icon: "/viva-rich-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
