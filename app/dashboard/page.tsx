"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";
import {  downloadApplicationsAsExcel } from "@/utils/excelHelper";
import { useSystemSettings } from "@/hooks/useSystemSettings"; // 📍 引入設定 Hook
import { useApplications } from "@/hooks/useApplications";     // 📍 引入資料 Hook

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
      <div className="min-h-screen flex items-center justify-center bg-[#E5EDFD] p-4 font-sans">
  {/* 📍 1. 卡片：改成白色背景，淡藍色邊框，更柔和的亮色陰影 */}
  <div className="bg-white p-10 rounded-3xl shadow-xl max-w-sm w-full border border-[#DCE8FC]">
    <div className="text-center mb-8">
      {/* 📍 2. 圖示背景：改成極淡的藍色圓圈 */}
      <div className="w-20 h-20 bg-[#F0F7FF] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#E1EEFF]">
        <span className="text-5xl block">🛡️</span>
      </div>
      
      {/* 📍 3. 標題與文字：改成深灰色，確保亮色背景下的清晰度 */}
      <h1 className="text-2xl font-extrabold text-[#1A365D]">通識中心後台管理</h1>
      <p className="text-gray-500 text-sm mt-2">請輸入管理員密碼以進入系統</p>
    </div>
    
    <form onSubmit={handleLogin} className="space-y-5">
      <div>
        {/* 📍 4. 密碼輸入框：改成淡灰底、淡藍邊框、深色文字，並加強 focus 效果 */}
        <input
          type="password"
          placeholder="••••••••"
          value={passwordInput}
          onChange={(e) => {
            setPasswordInput(e.target.value);
            setErrorMsg("");
          }}
          className="w-full bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl px-4 py-4 text-[#1A365D] focus:outline-none focus:ring-2 focus:ring-[#3182CE] focus:bg-white focus:border-[#3182CE] transition-all text-center tracking-[0.5em] text-xl placeholder:tracking-normal placeholder:text-gray-300"
          required
          autoFocus
        />
        {/* 📍 5. 錯誤訊息：在白底上改成亮紅色，更好辨識 */}
        {errorMsg && <p className="text-[#E53E3E] text-sm mt-2.5 text-center font-medium">{errorMsg}</p>}
      </div>
      
      {/* 📍 6. 登入按鈕：改成符合藍白主題的深藍色按鈕 */}
      <button 
        type="submit"
        className="w-full bg-[#3182CE] hover:bg-[#2B6CB0] text-white font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95"
      >
        登入系統
      </button>
    </form>
    
    {/* 📍 7. 底部裝飾 (選配)：加一點版權或裝飾文字 */}
    <p className="mt-8 text-center text-gray-400 text-xs">
      國立聯合大學 通識教育中心
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