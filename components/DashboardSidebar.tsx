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
    <aside className="w-64 bg-[#16181C] border-r border-gray-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-[#5DADE2] font-black text-xl tracking-wider">NUU 管理系統</h2>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest px-2 mb-4">學年度切換</p>
        
        {years.map(year => (
          <button
            key={year}
            onClick={() => onYearChange(year)}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium ${
              currentYear === year 
              ? "bg-[#5DADE2] text-white shadow-lg shadow-blue-900/20" 
              : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
            }`}
          >
            📅 {year}
          </button>
        ))}
      </nav>

      {/* 📍 側邊欄底部的「新增」按鈕 */}
      <div className="p-4 border-t border-gray-800">
        <button 
          onClick={handleAddNewYear}
          className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 py-3 rounded-xl border border-gray-700 border-dashed text-sm font-bold flex items-center justify-center gap-2"
        >
          <span>＋</span> 新增學年度表單
        </button>
      </div>
    </aside>
  );
}