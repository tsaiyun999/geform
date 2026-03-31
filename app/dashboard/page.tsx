"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

// 👇 引入積木
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentYear, setCurrentYear] = useState("116學年度"); // 📍 新增：紀錄當前選中的年度
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(true);

  // 1. 讀取特定年度的「申請資料」
  const fetchApplications = async (year: string) => {
    // 💡 注意：這需要在 applications 表格中有一個 year_name 欄位，或根據 semester 的前三碼過濾
    // 這裡我們暫時抓取全部，但在顯示時進行過濾，或是直接在 Query 時過濾
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      // .eq("year_name", year) // 如果資料庫有這欄位，取消註解這行
      .order("id", { ascending: false });

    if (error) {
      console.error("讀取資料失敗:", error);
    } else {
      // 📍 暫時性邏輯：如果資料庫還沒有 year_name 欄位，我們用學期字串來過濾 (例如 116 開頭的)
      const filtered = data?.filter(app => app.semester.startsWith(year.substring(0,3))) || [];
      setApplications(filtered);
    }
  };

  // 2. 讀取特定年度的「排程設定」
  const fetchSettings = async (year: string) => {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("year_name", year)
      .single();

    if (data && !error) {
      setStartDate(new Date(data.start_date).toISOString().slice(0, 16));
      setEndDate(new Date(data.end_date).toISOString().slice(0, 16));
      
      // 判斷按鈕狀態 (UI 同步用)
      const now = new Date();
      setIsFormOpen(now >= new Date(data.start_date) && now <= new Date(data.end_date));
    } else {
      // 如果該年度剛新增，還沒設定時間，給予空白
      setStartDate("");
      setEndDate("");
      setIsFormOpen(false);
    }
  };

  // 📍 監聽年度切換：當 Sidebar 切換年度時，重新抓取所有資料
  useEffect(() => {
    fetchApplications(currentYear);
    fetchSettings(currentYear);
  }, [currentYear]);

  // 3. 更新設定的邏輯 (存入特定年度)
  const updateSchedule = async () => {
    const { error } = await supabase
      .from("system_settings")
      .update({
        start_date: startDate,
        end_date: endDate
      })
      .eq("year_name", currentYear); // 📍 確保更新的是正確的年度
    
    if (error) alert("更新失敗");
    else alert(`✅ ${currentYear} 排程已更新！`);
  };

  // 4. 手動開關 (修改特定年度的時間)
  const toggleFormStatus = async () => {
    const targetDate = isFormOpen 
      ? new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() // 設為昨天
      : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(); // 設為下個月

    const { error } = await supabase
      .from("system_settings")
      .update({
        [isFormOpen ? "end_date" : "start_date"]: targetDate,
        ...(isFormOpen ? {} : { end_date: targetDate }) // 如果是開啟，順便把結束日期往後延
      })
      .eq("year_name", currentYear);

    if (!error) {
      alert(isFormOpen ? `🛑 ${currentYear} 已手動關閉` : `✅ ${currentYear} 已手動開啟`);
      fetchSettings(currentYear);
    }
  };

  // --- 以下 Excel、刪除、狀態更新邏輯維持不變，但資料來源已受 currentYear 過濾 ---
  const handleDownloadExcel = () => { /* ...原本的代碼... */ };
  const handleDelete = async (id: number) => { /* ...原本的代碼... */ };
  const handleStatusChange = async (id: number, currentStatus: string) => { /* ...原本的代碼... */ };

  return (
    <div className="flex min-h-screen font-sans text-gray-200" style={{ backgroundColor: "#121418" }}>
      
      {/* 📍 傳入年度切換功能給 Sidebar */}
      <Sidebar 
        currentYear={currentYear} 
        onYearChange={(year) => setCurrentYear(year)} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
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
          updateSchedule={updateSchedule}
        />

        <ApplicationTable 
          applications={applications} 
          handleStatusChange={handleStatusChange} 
          handleDelete={handleDelete} 
        />
      </main>
    </div>
  );
}