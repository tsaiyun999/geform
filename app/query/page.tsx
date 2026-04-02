"use client";

import React from "react";
import HeaderBanner from "@/components/HeaderBanner";
import CourseQuery from "@/components/CourseQuery";
import Link from "next/link";

export default function QueryPage() {
  return (
    /* 📍 背景改為淺藍色 (bg-blue-50)，並設定文字為深灰色 */
    <div className="min-h-screen bg-[#F0F7FF] text-gray-800">
      <HeaderBanner />
      
      <main className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        {/* 返回按鈕：顏色改為深藍灰色 */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="text-blue-600/70 hover:text-blue-800 transition-colors flex items-center gap-2 text-sm font-bold"
          >
            ← 回到開課申請首頁
          </Link>
        </div>

        {/* 標題區塊：文字改為深藍色 (text-blue-900) */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-black text-blue-900 mb-4 tracking-tight">
            歷年開課紀錄查詢系統
          </h1>
          <p className="text-blue-700/60 font-medium">
            請輸入教師姓名，即可找回科目代碼與相關資訊。
          </p>
        </div>

        {/* 📍 這裡引入的 CourseQuery 本身就是白底卡片，放在淺藍底上會非常好看 */}
        <div className="drop-shadow-xl">
           <CourseQuery />
        </div>

        {/* 溫馨提示：改為淺藍色調的框框 */}
        <div className="mt-16 bg-white/60 border border-blue-100 p-8 rounded-2xl text-sm text-blue-800/70 leading-relaxed backdrop-blur-sm">
          <p className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-blue-500">💡</span> 查詢說明：
          </p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>本系統包含 所有已存檔之通識開課資料。</li>
            <li>若您的姓名中有特殊字，請嘗試以常用字或空格進行查詢。</li>
            <li>科目代碼（DGGC 開頭）申請時之必要填寫資訊。</li>
          </ul>
        </div>
      </main>

      <footer className="py-12 text-center text-blue-300 text-xs font-medium">
        © 國立聯合大學 通識教育中心
      </footer>
    </div>
  );
}