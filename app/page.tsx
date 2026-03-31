"use client";

import React, { useState, useEffect } from "react";
import HeaderBanner from "@/components/HeaderBanner";
import AdminLoginBox from "@/components/AdminLoginBox";
import InstructionBox from "@/components/InstructionBox";
import ClosedNotice from "@/components/ClosedNotice";
import CourseApplicationForm from "@/components/CourseApplicationForm";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

export default function Home() {
  const [isSystemOpen, setIsSystemOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.from("system_settings").select("*").single();
        if (data && !error) {
          const now = new Date();
          const start = new Date(data.start_date);
          const end = new Date(data.end_date);
          
          // 📍 判斷當前時間是否在設定的區間內
          setIsSystemOpen(now >= start && now <= end);
        }
      } catch (err) {
        console.error("系統狀態檢查失敗:", err);
      } finally {
        setIsLoaded(true); // 確保資料抓完才顯示畫面，避免閃爍
      }
    };
    
    checkStatus();
  }, []);

  return (
    <>
      <HeaderBanner />
      <div className="main-container">
        {/* 主要內容區塊 */}
        <div className="form-card">
          {!isLoaded ? (
            <div className="text-center py-10 text-gray-400">系統載入中...</div>
          ) : isSystemOpen ? (
            /* 🟢 系統開放時：顯示說明與表單 */
            <>
              <InstructionBox />
              <div className="my-8 border-b border-gray-800"></div>
              <div className="my-8 p-4 bg-[#5DADE2]/10 border border-[#5DADE2]/30 rounded-xl flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="text-2xl">💡</span>
    <div>
      <p className="text-black font-bold">忘記 115 學年度科目代碼了嗎？</p>
      <p className="text-xs text-gray-400">輸入姓名即可快速找回您的歷年開課資料</p>
    </div>
  </div>
  <Link 
    href="/query" 
    className="bg-[#5DADE2] hover:bg-[#3498DB] text-white text-sm font-black py-2 px-6 rounded-lg transition-all shadow-lg shadow-blue-900/20 active:scale-95"
  >
    前往查詢系統 →
  </Link>
</div>
              <CourseApplicationForm />
            </>
          ) : (
            /* 🔴 系統關閉時：顯示關閉公告 */
            <ClosedNotice />
          )}
        </div>

        

        {/* 管理員登入入口 */}
        <AdminLoginBox />
      </div>

      {/* 簡單的頁尾 */}
      
    </>
  );
}