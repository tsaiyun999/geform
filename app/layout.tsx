import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 📍 1. 更新網站的 Metadata（顯示在瀏覽器分頁上）
export const metadata: Metadata = {
  title: "NUU 通識開課申請系統",
  description: "國立聯合大學通識教育中心 - 課程開設申請與後台管理系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 📍 2. 將語系更改為繁體中文
    <html
      lang="zh-TW"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 全站的頁面內容都會渲染在這裡 */}
        {children}
      </body>
    </html>
  );
}