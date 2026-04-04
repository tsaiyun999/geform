"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";
import {  downloadApplicationsAsExcel } from "@/utils/excelHelper";
import { useSystemSettings } from "@/hooks/useSystemSettings"; // 📍 引入設定 Hook
import { useApplications } from "@/hooks/useApplications";     // 📍 引入資料 Hook
import Link from "next/link";

export default function DashboardPage() {
  // 📍 1. 新增登入驗證的 State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const [currentYear, setCurrentYear] = useState("116學年度"); // 📍 新增：紀錄當前選中的年度

  // 📍 系統設定邏輯 (時間開關、排程)
  const { 
    startDate, endDate, isFormOpen, 
    setStartDate, setEndDate, 
    updateSchedule, toggleFormStatus 
  } = useSystemSettings(currentYear);

  // 📍 申請資料邏輯 (讀取、刪除、狀態)
  const { 
    applications, 
    deleteApplication, 
    updateApplicationStatus 
  } = useApplications(currentYear);

  // 📍 2. 檢查之前是否已經登入過 (記住登入狀態)
  useEffect(() => {
    const isLogged = sessionStorage.getItem("adminAuth") === "true";
    if (isLogged) setIsAuthenticated(true);
    setIsCheckingSession(false);
  }, []);

  // 📍 3. 處理登入邏輯
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 抓取環境變數的密碼，如果沒設定則預設為 admin123
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true"); // 存入瀏覽器，重新整理不用重登
    } else {
      setErrorMsg("密碼錯誤，請重新輸入！");
      setPasswordInput("");
    }
  };

  // 📍 4. 處理登出邏輯
  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    setIsAuthenticated(false);
  };

  const handleDownloadExcel = () => {
    // 📍 直接呼叫外部工具，並傳入當前資料與年度
    downloadApplicationsAsExcel(applications, currentYear);
  };

  // 🔒 如果還在檢查狀態，顯示空白防閃爍
  if (isCheckingSession) return <div className="min-h-screen bg-[#cbdaf8]"></div>;

  // 🔒 如果尚未登入，顯示「後台登入畫面」
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] p-4 font-sans">
  {/* 📍 1. 卡片：奶油白背景，淡淡的莓果粉邊框，更柔和的亮色陰影 */}
  <div className="bg-[#FEFDFB] p-10 rounded-3xl shadow-xl max-w-sm w-full border border-[#F1E4E8]">
    <div className="text-center mb-8">
      {/* 📍 2. 圖示背景：改成淡檸檬黃圓圈，看起來像布丁一樣可愛 */}
      <div className="w-20 h-20 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFF3B0]">
        <span className="text-5xl block">🛡️</span>
      </div>
      
      {/* 📍 3. 標題與文字：改為可可棕，這在馬卡龍色調中比藍色更和諧 */}
      <h1 className="text-2xl font-extrabold text-[#604D53] tracking-tight">通識中心後台管理</h1>
      <p className="text-[#8A767C] text-sm mt-2 font-medium">請輸入密碼進入系統</p>
    </div>
    
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        {/* 📍 4. 密碼輸入框：櫻花粉底、莓果粉邊框、可可棕字，focus 時會發出粉藍色光輝 */}
        <input
          type="password"
          placeholder="••••••••"
          value={passwordInput}
          onChange={(e) => {
            setPasswordInput(e.target.value);
            setErrorMsg("");
          }}
          className="w-full bg-[#FFF0F3] border border-[#F9D5E5] rounded-xl px-4 py-4 text-[#604D53] focus:outline-none focus:ring-2 focus:ring-[#B8E2F2] focus:bg-white focus:border-[#B8E2F2] transition-all text-center tracking-[0.5em] text-xl placeholder:tracking-normal placeholder:text-[#C4B5B9]"
          required
          autoFocus
        />
        {/* 📍 5. 錯誤訊息：在白底上改成珊瑚橘，柔和但不失警示作用 */}
        {errorMsg && <p className="text-[#FF9E7D] text-sm mt-2.5 text-center font-medium">{errorMsg}</p>}
      </div>
      
      {/* 📍 6. 登入按鈕：改成莓果粉色 (Berry Pink) */}
      <button 
        type="submit"
        className="w-full bg-[#F9D5E5] hover:bg-[#F2B6D2] text-[#604D53] font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#F9D5E5]/30 active:scale-95"
      >
        登入系統
      </button>
    </form>
    
    {/* 📍 7. 底部裝飾：溫暖的淺粉棕色 */}
    <p className="mt-8 text-center text-[#C4B5B9] text-xs font-medium">
      國立聯合大學 通識教育中心 🍓
    </p>
  </div>
</div>
    );
  }

  // ✅ 登入成功後，顯示原始的後台介面
  return (
    <div className="flex min-h-screen font-sans bg-[#F0F4F8] text-gray-700">
      
      {/* 📍 傳入年度切換功能給 Sidebar */}

      <Sidebar 
        currentYear={currentYear} 
        onYearChange={(year) => setCurrentYear(year)} 
      />

      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* 📍 2. 登出按鈕：改為白色小卡片樣式，懸停時變紅 */}
        <button 
          onClick={handleLogout}
          className="absolute top-8 right-8 text-sm font-medium text-gray-400 hover:text-red-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 transition-all active:scale-95"
        >
          登出管理員
        </button>

        {/* 📍 3. 目前管理年度標籤：改為淡藍底、深藍字，增加呼吸燈感 */}
        <div className="mb-6 inline-flex items-center gap-2 bg-[#E1EFFE] text-[#1E429F] px-4 py-1.5 rounded-full text-xs font-bold border border-[#BCDBFE] shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-[#3182CE]"></span>
          正在管理：{currentYear}
        </div>
        <Link 
    href="/dashboard/past-courses" 
    className="inline-flex items-center gap-2 bg-[#E6FFFA] text-[#2C7A7B] px-4 py-1.5 rounded-full text-xs font-bold border border-[#B2F5EA] shadow-sm hover:bg-[#B2F5EA] transition-all active:scale-95 group"
  >
    <span className="group-hover:rotate-12 transition-transform">📚</span>
    進入歷年資料管理庫
  </Link>
        <DashboardHeader 
          applicationsCount={applications.length} 
          isFormOpen={isFormOpen} 
          toggleFormStatus={toggleFormStatus} 
          handleDownloadExcel={handleDownloadExcel} 
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          updateSchedule={() => updateSchedule(startDate, endDate)}
        />

        <ApplicationTable 
          applications={applications} 
          handleStatusChange={updateApplicationStatus} 
          handleDelete={deleteApplication} 
        />
      </main>
    </div>
  );
}