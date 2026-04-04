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
    <header className="mb-10 flex flex-col lg:flex-row lg:items-center lg:justify-between border-b border-[#F1E4E8] pb-8 gap-6 text-[#604D53]">
  
  {/* 📍 1. 左側標題區：改為可可棕文字與粉藍裝飾 */}
  <div className="flex-shrink-0">
    <h1 className="text-3xl font-extrabold text-[#604D53] tracking-tight">資料管理面板</h1>
    <p className="mt-2 text-[#8A767C] font-medium">
      目前共有 <span className="font-bold text-[#604D53] bg-[#EBF8FF] px-2 py-0.5 rounded-md border border-[#B8E2F2]">{applicationsCount}</span> 筆申請資料。
    </p>
  </div>

  {/* 📍 2. 中間排程設定區：奶油白底、粉藍邊框 */}
  <div className="bg-[#FEFDFB] p-5 rounded-2xl border border-[#B8E2F2] shadow-sm shadow-[#B8E2F2]/20 flex flex-col sm:flex-row gap-4 items-end flex-grow max-w-4xl">
    <div className="w-full sm:w-auto flex-1">
      <label className="block text-xs font-bold text-[#8A767C] mb-1.5 ml-1 flex items-center gap-1">
        <span className="text-[#B8E2F2]">🕒</span> 自動開啟時間
      </label>
      <input 
        type="datetime-local" 
        value={startDate} 
        onChange={e => setStartDate(e.target.value)} 
        className="w-full bg-[#FFF5F7] border border-[#F9D5E5] text-[#604D53] p-2.5 rounded-xl focus:ring-2 focus:ring-[#B8E2F2] focus:border-[#B8E2F2] focus:outline-none transition-all text-sm" 
      />
    </div>
    <div className="w-full sm:w-auto flex-1">
      <label className="block text-xs font-bold text-[#8A767C] mb-1.5 ml-1 flex items-center gap-1">
        <span className="text-[#F9D5E5]">⌛</span> 自動關閉時間
      </label>
      <input 
        type="datetime-local" 
        value={endDate} 
        onChange={e => setEndDate(e.target.value)} 
        className="w-full bg-[#FFF5F7] border border-[#F9D5E5] text-[#604D53] p-2.5 rounded-xl focus:ring-2 focus:ring-[#B8E2F2] focus:border-[#B8E2F2] focus:outline-none transition-all text-sm" 
      />
    </div>
    <button 
      onClick={updateSchedule} 
      className="w-full sm:w-auto bg-[#B8E2F2] hover:bg-[#A3D8EC] text-[#604D53] px-6 py-2.5 rounded-xl font-bold shadow-md shadow-[#B8E2F2]/30 transition-all active:scale-95 whitespace-nowrap border border-[#B8E2F2]"
    >
      儲存排程
    </button>
  </div>

  {/* 📍 3. 右側按鈕區：莓果粉與薄荷綠按鈕 */}
  <div className="flex flex-row gap-4 flex-shrink-0">
    <button 
      onClick={toggleFormStatus} 
      className={`flex-1 sm:flex-none flex items-center justify-center rounded-xl px-6 py-3 font-bold text-[#604D53] shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0 border ${
        isFormOpen 
          ? 'bg-[#FFD1BA] border-[#FFB38A] hover:bg-[#FFC0A1] shadow-[#FFD1BA]/40' // 珊瑚橙
          : 'bg-[#C7E9C0] border-[#9AE6B4] hover:bg-[#B3DEAB] shadow-[#C7E9C0]/40' // 薄荷綠
      }`}
    >
      {isFormOpen ? "🛑 關閉申請" : "✅ 開放申請"}
    </button>
    
    <button 
      onClick={handleDownloadExcel} 
      className="flex-1 sm:flex-none flex items-center justify-center rounded-xl bg-[#F9D5E5] border-[#F2B6D2] px-6 py-3 font-bold text-[#604D53] shadow-md shadow-[#F9D5E5]/40 transition-all hover:bg-[#F2B6D2] hover:-translate-y-0.5 active:translate-y-0"
    >
      📥 匯出 Excel
    </button>
  </div>
</header>
  );
}