"use client";

import React from "react";

// 👇 定義這個積木需要從「主程式」接收哪些東西
interface DashboardHeaderProps {
  applicationsCount: number;      // 申請總筆數
  isFormOpen: boolean;            // 表單是否開放的狀態
  toggleFormStatus: () => void;   // 切換開關的函數
  handleDownloadExcel: () => void;// 下載 Excel 的函數
  startDate: string;
  endDate: string;
  setStartDate: (val: string) => void;
  setEndDate: (val: string) => void;
  updateSchedule: () => void;
}

export default function DashboardHeader({ 
  applicationsCount, 
  isFormOpen, 
  toggleFormStatus, 
  handleDownloadExcel ,
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  updateSchedule
}: DashboardHeaderProps) {
  return (
    <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-800 pb-6">
      <div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight">資料管理面板</h1>
        <p className="mt-3 text-lg text-gray-400">
          目前共有 <span className="font-bold text-[#5DADE2]">{applicationsCount}</span> 筆申請資料。
        </p>
      </div>
      <div className="bg-gray-800 p-4 rounded-lg mb-6 flex gap-4 items-end">
  <div>
    <label className="block text-xs text-gray-400 mb-1">自動開啟時間</label>
    <input type="datetime-local" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-gray-700 text-white p-2 rounded" />
  </div>
  <div>
    <label className="block text-xs text-gray-400 mb-1">自動關閉時間</label>
    <input type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-gray-700 text-white p-2 rounded" />
  </div>
  <button onClick={updateSchedule} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded font-bold">儲存排程</button>
</div>
      <div className="flex gap-4 mt-5 md:mt-0">
        <button 
          onClick={toggleFormStatus} 
          className={`flex items-center justify-center rounded-lg px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0 ${isFormOpen ? 'bg-red-700 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-500'}`}
        >
          {isFormOpen ? "🛑 關閉前台申請" : "✅ 開放前台申請"}
        </button>
        <button 
          onClick={handleDownloadExcel} 
          className="flex items-center justify-center rounded-lg bg-[#2ECC71] px-6 py-3 font-bold text-white shadow-lg transition-all hover:bg-[#27AE60] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          📥 匯出 Excel
        </button>
      </div>
    </header>
  );
}