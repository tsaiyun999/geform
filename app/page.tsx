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
  const [activeYear, setActiveYear] = useState("加載中...");
  const [deadline, setDeadline] = useState("");
 useEffect(() => {
    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("*")
          .order("end_date", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data && !error) {
  // 📍 1. 設定年度
  setActiveYear(data.year_name); 
  
  // 📍 2. 強化日期轉換邏輯
  const d = new Date(data.end_date);
  
  // 檢查日期是否合法
  if (!isNaN(d.getTime())) {
    const rocYear = d.getFullYear() - 1911;
    const month = d.getMonth() + 1;
    const date = d.getDate();
    const dateString = `${rocYear}年${month}月${date}日`;
    
    console.log("成功產生日期字串:", dateString); // 👈 打開 F12 檢查這行
    setDeadline(dateString);
  } else {
    setDeadline("日期設定中");
  }

  // 📍 3. 判斷系統狀態
  const now = new Date();
  const start = new Date(data.start_date);
  const end = new Date(data.end_date);
  const params = new URLSearchParams(window.location.search);
  const isPreview = params.get("preview") === "true";
  
  setIsSystemOpen((now >= start && now <= end) || isPreview);

        }
      } catch (err) {
        console.error("抓取年度失敗:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    checkStatus();
  }, []);
  return (
    <>
      <HeaderBanner year={activeYear} />
      <div className="main-container">
        {/* 主要內容區塊 */}
        <div className="form-card">
          {!isLoaded ? (
            <div className="text-center py-10 text-gray-400">系統載入中...</div>
          ) : isSystemOpen ? (
            /* 🟢 系統開放時：顯示說明與表單 */
            <>
              <InstructionBox deadline={deadline} />
              <div className="my-8 border-b border-gray-800"></div>
              <div className="my-8 p-4 bg-[#5DADE2]/10 border border-[#5DADE2]/30 rounded-xl flex items-center justify-between">
  <div className="flex items-center gap-3">
    <span className="text-2xl">💡</span>
    <div>
      <p className="text-black font-bold">忘記科目代碼了嗎？</p>
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

      
    </>
  );
}