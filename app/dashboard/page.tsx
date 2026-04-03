"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";
import { downloadApplicationsAsCsv } from "@/utils/excelHelper";
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
    downloadApplicationsAsCsv(applications, currentYear);
  };

  // 🔒 如果還在檢查狀態，顯示空白防閃爍
  if (isCheckingSession) return <div className="min-h-screen bg-[#121418]"></div>;

  // 🔒 如果尚未登入，顯示「後台登入畫面」
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121418] text-white p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full border border-gray-700">
          <div className="text-center mb-6">
            <span className="text-5xl block mb-2">🛡️</span>
            <h1 className="text-2xl font-bold text-[#5DADE2]">通識中心後台管理</h1>
            <p className="text-gray-400 text-sm mt-2">請輸入管理員密碼以進入系統</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="請輸入密碼"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5DADE2] text-center tracking-widest"
                required
                autoFocus
              />
              {errorMsg && <p className="text-red-400 text-sm mt-2 text-center">{errorMsg}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-[#5DADE2] hover:bg-[#3498DB] text-white font-bold py-3 rounded-lg transition shadow-lg"
            >
              登入系統
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ 登入成功後，顯示原始的後台介面
  return (
    <div className="flex min-h-screen font-sans text-gray-200" style={{ backgroundColor: "#121418" }}>
      
      {/* 📍 傳入年度切換功能給 Sidebar */}
      <Sidebar 
        currentYear={currentYear} 
        onYearChange={(year) => setCurrentYear(year)} 
      />

      <main className="flex-1 p-8 overflow-y-auto relative">
        {/* 📍 新增的登出按鈕 */}
        <button 
          onClick={handleLogout}
          className="absolute top-8 right-8 text-sm text-gray-400 hover:text-red-400 underline transition"
        >
          登出管理員
        </button>

        {/* 顯示目前管理年度標籤 */}
        <div className="mb-4 inline-block bg-[#5DADE2]/10 text-[#5DADE2] px-3 py-1 rounded-full text-xs font-bold border border-[#5DADE2]/20">
          📍 正在管理：{currentYear}
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