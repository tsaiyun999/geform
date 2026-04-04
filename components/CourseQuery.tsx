"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function CourseQuery() {
  const [teacher, setTeacher] = useState("");
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!teacher.trim()) {
      alert("請輸入教師姓名 🍓");
      return;
    }
    setLoading(true);
    
    // 📍 關鍵修改：改從 past_courses 抓取，並使用 .ilike 支援模糊搜尋
    const { data, error } = await supabase
      .from("past_courses")
      .select("*")
      .ilike("teacher_name", `%${teacher.trim()}%`) 
      .order("created_at", { ascending: false });

    if (error) {
      alert("連線出錯，請稍後再試 🍦");
    } else if (data && data.length > 0) {
      setResult(data);
    } else {
      alert("查無此教師的紀錄，請確認姓名是否正確 🍮");
      setResult(null);
    }
    setLoading(false);
  };

  return (
    /* 📍 容器：奶油白背景、大圓角、帶有馬卡龍藍色的柔和陰影 */
    <div className="bg-[#FEFDFB] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(184,226,242,0.4)] max-w-2xl mx-auto border border-[#F1E4E8] font-sans">
      
      {/* 標題區 */}
      <div className="mb-10 text-center md:text-left">
        <h3 className="text-2xl font-black text-[#604D53] mb-2 flex items-center justify-center md:justify-start gap-3">
          <span className="text-3xl">🔍</span> 歷年代碼查詢
        </h3>
        <p className="text-[#8A767C] text-sm font-medium">輸入姓名即可快速找回您的科目資訊</p>
      </div>

      {/* 查詢輸入區 */}
      <div className="space-y-8">
        <div className="form-group">
          <label className="text-[#604D53] font-black text-xs uppercase tracking-widest block mb-3 ml-2">授課教師姓名</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <input 
              type="text" 
              value={teacher} 
              onChange={(e) => setTeacher(e.target.value)}
              className="flex-1 bg-[#FFF5F7] border-2 border-[#F9D5E5] p-4 rounded-2xl text-[#604D53] font-bold focus:border-[#B8E2F2] focus:bg-white outline-none transition-all placeholder:text-[#C4B5B9]"
              placeholder=""
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            />
            <button 
              onClick={handleQuery}
              disabled={loading}
              className="bg-[#B8E2F2] hover:bg-[#A3D8EC] text-[#604D53] font-black py-4 px-10 rounded-2xl transition-all active:scale-95 shadow-md shadow-[#B8E2F2]/40 disabled:opacity-50"
            >
              {loading ? "尋找中..." : "立刻查詢"}
            </button>
          </div>
        </div>

        {/* 查詢結果區：馬卡龍色塊組合 */}
        {result && (
          <div className="mt-10 pt-10 border-t border-[#F1E4E8] space-y-4">
            <p className="text-[10px] font-black text-[#F9D5E5] uppercase tracking-[0.2em] mb-6 text-center md:text-left">Search Results Found</p>
            {result.map((app) => (
              <div key={app.id} className="bg-white p-5 rounded-2xl border border-[#F1E4E8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#B8E2F2] hover:shadow-sm transition-all group">
                <div>
                  <span className="text-[10px] font-bold text-[#B8E2F2] bg-[#F0F9FF] px-2 py-0.5 rounded border border-[#D0EFFF] block w-fit mb-2">
                    {app.course_category || "通識課程"}
                  </span>
                  <span className="font-black text-[#604D53] text-lg">{app.course_name}</span>
                </div>
                
                <div className="bg-[#FFFBEB] border border-[#FFF3B0] px-5 py-3 rounded-2xl shadow-sm self-end sm:self-center">
                  <span className="text-[10px] text-[#8A767C] font-bold block text-right mb-1">科目代碼</span>
                  <span className="font-mono font-black text-[#604D53] text-xl tracking-wider select-all cursor-pointer" title="點擊可選取複製">
                    {app.course_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10 text-center text-[11px] text-[#C4B5B9] font-bold tracking-widest">
        🍓 NATIONAL UNITED UNIVERSITY | GE CENTER 🍓
      </div>
    </div>
  );
}