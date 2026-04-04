"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

interface SidebarProps {
  currentYear: string;
  onYearChange: (year: string) => void;
}

export default function DashboardSidebar({ currentYear, onYearChange }: SidebarProps) {
  const [years, setYears] = useState<string[]>([]);

  // 抓取目前資料庫中所有的學年度設定
  const fetchYears = async () => {
    const { data } = await supabase.from("system_settings").select("year_name").order("year_name", { ascending: false });
    if (data) setYears(data.map(d => d.year_name));
  };

  useEffect(() => { fetchYears(); }, []);

  // 📍 新增新年度的邏輯
 const handleAddNewYear = async () => {
  const nextYear = prompt("請輸入欲新增的學年度名稱（例如：117學年度）");
  if (!nextYear) return;

  // 📍 注意：這裡不要傳入 id，讓資料庫自動生成
  const { error } = await supabase.from("system_settings").insert([
    { 
      year_name: nextYear, 
      start_date: new Date().toISOString(), 
      end_date: new Date().toISOString() 
    }
  ]);

  if (error) {
    console.error("新增出錯細節:", error); // 這裡可以幫你抓出到底是哪邊衝突
    alert("新增失敗，可能名稱已存在或系統錯誤");
  } else {
    alert(`✅ 已成功建立 ${nextYear} 管理頁面`);
    fetchYears(); // 重新整理列表
  }
};
  return (
    <aside className="w-64 bg-[#FEFDFB] border-r border-[#F1E4E8] flex flex-col h-screen sticky top-0 shadow-sm text-[#604D53]">
  {/* 📍 1. 標題區：櫻花粉裝飾 + 可可棕文字 */}
  <div className="p-6 border-b border-[#F1E4E8] bg-white">
    <h2 className="text-[#604D53] font-black text-xl tracking-wider flex items-center gap-2">
      <span className="w-2 h-6 bg-[#F9D5E5] rounded-full shadow-[0_0_8px_rgba(249,213,229,0.8)]"></span>
      NUU 管理系統
    </h2>
  </div>

  <nav className="flex-1 p-4 space-y-2 overflow-y-auto bg-[#FEFDFB]">
    <p className="text-[11px] text-[#8A767C] font-bold uppercase tracking-widest px-3 mb-4 mt-2">
      學年度切換
    </p>
    
    {years.map(year => (
      <button
        key={year}
        onClick={() => onYearChange(year)}
        className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold flex items-center gap-3 ${
          currentYear === year 
          ? "bg-[#C7E9C0] text-[#22543D] shadow-md shadow-[#C7E9C0]/40 scale-[1.02] border border-[#A1D99B]" 
          : "text-[#604D53] hover:bg-[#FFFBEB] hover:text-[#8A767C]"
        }`}
      >
        <span className={`text-lg ${currentYear === year ? "opacity-100" : "opacity-40"}`}>🍦</span>
        {year}
      </button>
    ))}
  </nav>

  {/* 📍 2. 側邊欄底部：馬卡龍藍虛線風格 */}
  <div className="p-4 border-t border-[#F1E4E8] bg-white">
    <button 
      onClick={handleAddNewYear}
      className="w-full bg-[#F0F9FF] hover:bg-[#D0EFFF] text-[#604D53] py-3 rounded-xl border border-[#B8E2F2] border-dashed text-sm font-bold flex items-center justify-center gap-2 transition-all group"
    >
      <span className="text-[#B8E2F2] group-hover:rotate-90 group-hover:scale-125 transition-transform">＋</span> 
      新增學年度表單
    </button>
    
    <p className="mt-4 text-[10px] text-center text-[#C4B5B9] font-medium tracking-tighter">
      國立聯合大學 通識教育中心 🍓
    </p>
  </div>
</aside>
  );
}