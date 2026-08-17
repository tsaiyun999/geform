"use client";

import React, { useState } from "react";
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable from "@/components/ApplicationTable";
import { downloadApplicationsAsExcel } from "@/utils/excelHelper";
import { useSystemSettings } from "@/hooks/useSystemSettings"; 
import { useApplications } from "@/hooks/useApplications";    
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  const [currentYear, setCurrentYear] = useState("116學年度"); 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { 
    startDate, endDate, isFormOpen, 
    setStartDate, setEndDate, 
    updateSchedule, toggleFormStatus 
  } = useSystemSettings(currentYear);

  const { 
    applications, 
    deleteApplication, 
    updateApplicationStatus 
  } = useApplications(currentYear);

  // 📍 處理登出邏輯 (清除狀態並重整)
  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    window.location.reload(); 
  };

  const handleDownloadExcel = () => {
    downloadApplicationsAsExcel(applications, currentYear);
  };

  return (
    <div className="flex h-screen font-sans bg-[#F0F4F8] text-gray-700 overflow-hidden relative">
      
      {/* 🌟 頂部導覽列 */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-[#F1E4E8] z-20 shadow-sm px-4 md:px-6 py-3 min-h-[4rem] flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
        
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-[#F9D5E5] rounded-full shadow-[0_0_8px_rgba(249,213,229,0.8)] shrink-0"></span>
            <span className="font-black text-[#604D53] tracking-wider text-base md:text-xl truncate">通識中心表單後臺</span>
          </div>

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
            <span className="group-hover:rotate-12 transition-transform">📋</span>
            進入表單內容管理
          </Link>

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

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex justify-end p-2 border-b border-[#F1E4E8] bg-[#FEFDFB]">
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="text-[#8A767C] hover:bg-[#F9D5E5] hover:text-[#604D53] w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          <Sidebar 
            currentYear={currentYear} 
            onYearChange={(year) => {
              setCurrentYear(year);
              setIsSidebarOpen(false);
            }} 
          />
        </div>
      </div>

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