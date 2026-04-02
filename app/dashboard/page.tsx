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

  const handleDownloadExcel = () => {
    // 📍 直接呼叫外部工具，並傳入當前資料與年度
    downloadApplicationsAsCsv(applications, currentYear);
  };
 
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