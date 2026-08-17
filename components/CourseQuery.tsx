"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function CourseQuery() {
  const [teacher, setTeacher] = useState("");
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!teacher.trim()) {
      alert("請輸入教師姓名 ");
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
      alert("連線出錯，請稍後再試 ");
    } else if (data && data.length > 0) {
      setResult(data);
    } else {
      alert("查無此教師的紀錄，請確認姓名是否正確 ");
      setResult(null);
    }
    setLoading(false);
  };

  return (
    /* 📍 容器：奶油白背景、大圓角、帶有馬卡龍藍色的柔和陰影。強制套用標楷體 */
    <div 
      className="bg-[#FEFDFB] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(184,226,242,0.4)] max-w-2xl mx-auto border border-[#F1E4E8]"
      style={{ fontFamily: '"標楷體", "DFKai-SB", "BiauKai", serif' }}
    >
      
      {/* 標題區 */}
      <div className="mb-8 text-center md:text-left">
        <h3 className="text-xl font-black text-[#604D53] mb-2 flex items-center justify-center md:justify-start gap-2">
          <span className="text-2xl">🔍</span> 歷年代碼查詢
        </h3>
      </div>

      {/* 查詢輸入區 */}
      <div className="space-y-6">
        <div className="form-group">
          {/* 標籤字體放大為 text-sm */}
          <label className="text-[#604D53] font-black text-sm tracking-widest block mb-2 ml-1">授課教師姓名</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={teacher} 
              onChange={(e) => setTeacher(e.target.value)}
              className="flex-1 bg-[#FFF5F7] border-2 border-[#F9D5E5] p-3 rounded-xl text-[#604D53] text-base font-bold focus:border-[#B8E2F2] focus:bg-white outline-none transition-all placeholder:text-[#C4B5B9]"
              placeholder="請輸入教師姓名..."
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            />
            <button 
              onClick={handleQuery}
              disabled={loading}
              className="bg-[#B8E2F2] hover:bg-[#A3D8EC] text-[#604D53] text-base font-black py-3 px-8 rounded-xl transition-all active:scale-95 shadow-sm shadow-[#B8E2F2]/40 disabled:opacity-50"
            >
              {loading ? "尋找中..." : "立刻查詢"}
            </button>
          </div>
        </div>

        {/* 查詢結果區：馬卡龍色塊組合 */}
        {result && (
          <div className="mt-8 pt-8 border-t border-[#F1E4E8] space-y-4">
            {/* 提示文字放大為 text-sm */}
            <p className="text-sm font-black text-[#F9D5E5] tracking-wider mb-4 text-center md:text-left">
              查詢結果 (Search Results)
            </p>
            {result.map((app) => (
              <div key={app.id} className="bg-white p-4 rounded-xl border border-[#F1E4E8] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:border-[#B8E2F2] hover:shadow-sm transition-all group">
                <div>
                  {/* 標籤字體放大為 text-xs */}
                  <span className="text-xs font-bold text-[#B8E2F2] bg-[#F0F9FF] px-2 py-1 rounded border border-[#D0EFFF] block w-fit mb-1">
                    {app.course_category || "通識課程"}
                  </span>
                  <span className="font-black text-[#604D53] text-lg">{app.course_name}</span>
                </div>
                
                <div className="bg-[#FFFBEB] border border-[#FFF3B0] px-4 py-2 rounded-xl shadow-sm self-end sm:self-center flex flex-col sm:items-end">
                  {/* 小標籤放大為 text-sm */}
                  <span className="text-sm text-[#8A767C] font-bold block mb-1">科目代碼</span>
                  {/* 科目代碼縮小為 text-lg */}
                  <span className="font-mono font-black text-[#604D53] text-lg tracking-wider select-all cursor-pointer" title="點擊可選取複製">
                    {app.course_code}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}