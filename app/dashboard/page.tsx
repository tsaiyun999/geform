"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";
import { downloadApplicationsAsExcel } from "@/utils/excelHelper";
import { useSystemSettings } from "@/hooks/useSystemSettings"; // 📍 引入設定 Hook
import { useApplications } from "@/hooks/useApplications";     // 📍 引入資料 Hook
import Link from "next/link";

export default function DashboardPage() {
  // 📍 1. 新增登入驗證的 State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // 📍 2. 狀態管理：目前選中的年度 & 側邊欄開關 (漢堡選單用)
  const [currentYear, setCurrentYear] = useState("116學年度"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // 📍 3. 檢查之前是否已經登入過 (記住登入狀態)
  useEffect(() => {
    const isLogged = sessionStorage.getItem("adminAuth") === "true";
    if (isLogged) setIsAuthenticated(true);
    setIsCheckingSession(false);
  }, []);

  // 📍 4. 處理登入邏輯
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

  // 📍 5. 處理登出邏輯
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
        {/* 卡片：奶油白背景，淡淡的莓果粉邊框，更柔和的亮色陰影 */}
        <div className="bg-[#FEFDFB] p-10 rounded-3xl shadow-xl max-w-sm w-full border border-[#F1E4E8]">
          <div className="text-center mb-8">
            {/* 圖示背景：改成淡檸檬黃圓圈，看起來像布丁一樣可愛 */}
            <div className="w-20 h-20 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFF3B0]">
              <span className="text-5xl block">🛡️</span>
            </div>
            
            {/* 標題與文字：改為可可棕 */}
            <h1 className="text-2xl font-extrabold text-[#604D53] tracking-tight">通識中心後台管理</h1>
            <p className="text-[#8A767C] text-sm mt-2 font-medium">請輸入密碼進入系統</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              {/* 密碼輸入框：櫻花粉底、莓果粉邊框、可可棕字 */}
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
              {/* 錯誤訊息：在白底上改成珊瑚橘 */}
              {errorMsg && <p className="text-[#FF9E7D] text-sm mt-2.5 text-center font-medium">{errorMsg}</p>}
            </div>
            
            {/* 登入按鈕：改成莓果粉色 */}
            <button 
              type="submit"
              className="w-full bg-[#F9D5E5] hover:bg-[#F2B6D2] text-[#604D53] font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#F9D5E5]/30 active:scale-95"
            >
              登入系統
            </button>
          </form>
          
          {/* 底部裝飾：溫暖的淺粉棕色 */}
          <p className="mt-8 text-center text-[#C4B5B9] text-xs font-medium">
            國立聯合大學 通識教育中心 🍓
          </p>
        </div>
      </div>
    );
  }

  // ✅ 登入成功後，顯示完整的響應式後台介面
  return (
    <div className="flex h-screen font-sans bg-[#F0F4F8] text-gray-700 overflow-hidden relative">
      
      {/* =========================================
          🌟 頂部導覽列 (全裝置顯示，支援自動換行)
      ========================================= */}
      {/* 📍 使用 min-h-[4rem] 確保基本高度，同時允許 py-3 上下內距應對多行內容 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#F1E4E8] z-20 shadow-sm px-4 md:px-6 py-3 min-h-[4rem] flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        
        {/* 上半部 (手機版)：標題 與 右側的登出/漢堡按鈕 */}
        <div className="flex items-center justify-between w-full md:w-auto">
          {/* 標題 */}
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#F9D5E5] rounded-full shadow-[0_0_8px_rgba(249,213,229,0.8)] shrink-0"></span>
            <span className="font-black text-[#604D53] tracking-wider text-base md:text-xl truncate">通識中心表單後臺</span>
          </div>

          {/* 右上角按鈕區 (手機版顯示在這裡，電腦版會利用 md:hidden 隱藏此區塊，並在下方顯示) */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <button 
              onClick={handleLogout}
              className="text-xs font-medium text-gray-500 hover:text-red-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200"
            >
              登出
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1 text-[#604D53] hover:bg-[#F9D5E5] rounded-lg flex items-center justify-center"
            >
              <span className="text-2xl leading-none">☰</span>
            </button>
          </div>
        </div>

        {/* 下半部 (手機版) / 併入右側 (電腦版)：標籤與歷年資料庫按鈕 */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 w-full md:w-auto">
          
          <div className="inline-flex items-center gap-1.5 bg-[#E1EFFE] text-[#1E429F] px-3 py-1.5 rounded-full text-xs font-bold border border-[#BCDBFE] shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#3182CE]"></span>
            正在管理：{currentYear}
          </div>
          
          <Link 
            href="/dashboard/past-courses" 
            className="inline-flex items-center gap-1.5 bg-[#E6FFFA] text-[#2C7A7B] px-3 py-1.5 rounded-full text-xs font-bold border border-[#B2F5EA] shadow-sm hover:bg-[#B2F5EA] transition-all active:scale-95 group"
          >
            <span className="group-hover:rotate-12 transition-transform">📚</span>
            進入歷年資料管理庫
          </Link>
          <Link 
            href="/dashboard/form-manager" 
            className="inline-flex items-center gap-1.5 bg-[#E6FFFA] text-[#2C7A7B] px-3 py-1.5 rounded-full text-xs font-bold border border-[#B2F5EA] shadow-sm hover:bg-[#B2F5EA] transition-all active:scale-95 group"
          >
            <span className="group-hover:rotate-12 transition-transform">📚</span>
            進入表單內容管理
          </Link>

          {/* 電腦版才顯示在這裡的按鈕區 (保持右對齊) */}
          <div className="hidden md:flex items-center gap-3 pl-2 border-l border-gray-200">
            <button 
              onClick={handleLogout}
              className="text-sm font-medium text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200 hover:border-red-200 transition-all active:scale-95"
            >
              登出
            </button>
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-[#604D53] hover:bg-[#F9D5E5] rounded-lg transition-colors flex items-center justify-center"
            >
              <span className="text-2xl leading-none">☰</span>
            </button>
          </div>

        </div>
      </div>

      {/* =========================================
          🌑 點擊旁邊收回：半透明黑色遮罩 (全裝置)
      ========================================= */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* =========================================
          🗂️ 側邊欄區塊：全裝置皆為滑入動畫
      ========================================= */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 側邊欄右上角的「收回 (✕)」按鈕 */}
        <div className="flex justify-end p-2 border-b border-[#F1E4E8] bg-[#FEFDFB]">
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-[#8A767C] hover:bg-[#F9D5E5] hover:text-[#604D53] w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 載入 Sidebar，並在切換年度時自動關閉選單 */}
        <div className="flex-1 overflow-hidden">
          <Sidebar 
            currentYear={currentYear} 
            onYearChange={(year) => {
              setCurrentYear(year);
              setIsSidebarOpen(false); // 📍 切換後自動收回側邊欄
            }} 
          />
        </div>
      </div>

      {/* =========================================
          📄 主內容區塊 (資料管理面板)
      ========================================= */}
      {/* 📍 pt-32 (128px)：因為手機版導覽列現在是兩排，內距加大確保不會蓋住下面的內容 */}
      <main className="flex-1 overflow-y-auto relative pt-32 md:pt-24 p-4 md:p-8 w-full">
        
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