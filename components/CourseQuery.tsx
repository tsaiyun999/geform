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
    
    // 📍 支援模糊搜尋
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
    /* 📍 容器：奶油白背景、大圓角、清晰邊框。強制套用標楷體 */
    <div 
      className="bg-[#FEFDFB] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(184,226,242,0.4)] max-w-2xl mx-auto border-2 border-[#E2C4CE]"
      style={{ fontFamily: '"標楷體", "DFKai-SB", "BiauKai", serif' }}
    >
      
      {/* 標題區 */}
      <div className="mb-8 text-center md:text-left">
        <h3 className="text-xl font-black text-[#4A383E] mb-2 flex items-center justify-center md:justify-start gap-2">
          <span className="text-2xl">🔍</span> 歷年代碼查詢
        </h3>
      </div>

      {/* 查詢輸入區 */}
      <div className="space-y-6">
        <div className="form-group">
          {/* 標籤字體加深 */}
          <label className="text-[#4A383E] font-black text-sm tracking-widest block mb-2 ml-1">授課教師姓名</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              type="text" 
              value={teacher} 
              onChange={(e) => setTeacher(e.target.value)}
              className="flex-1 bg-[#FFF5F7] border-2 border-[#E2C4CE] p-3 rounded-xl text-[#4A383E] text-base font-bold focus:border-[#3182CE] focus:bg-white outline-none transition-all placeholder:text-[#9E868D]"
              placeholder="請輸入教師姓名..."
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
            />
            <button 
              onClick={handleQuery}
              disabled={loading}
              className="bg-[#3182CE] hover:bg-[#2B6CB0] text-white text-base font-black py-3 px-8 rounded-xl transition-all active:scale-95 shadow-md disabled:opacity-50"
            >
              {loading ? "尋找中..." : "立刻查詢"}
            </button>
          </div>
        </div>

        {/* 查詢結果區 */}
        {result && (
          <div className="mt-8 pt-8 border-t-2 border-[#E2C4CE] space-y-4">
            {/* 提示文字改用更清晰的深色 */}
            <p className="text-sm font-black text-[#7A5C67] tracking-wider mb-4 text-center md:text-left">
              查詢結果 (Search Results)
            </p>
            {result.map((app) => (
              <div key={app.id} className="bg-white p-5 rounded-xl border-2 border-[#E2C4CE] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#3182CE] hover:shadow-md transition-all group">
                <div className="space-y-1.5">
                  {/* 學年度與課程類別標籤（字體與邊框加深） */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black text-[#975A16] bg-[#FEFCBF] px-3 py-1 rounded-full border border-[#ECC94B]">
                      📅 {app.academic_year || "未註明學年度"}
                    </span>
                    <span className="text-xs font-black text-[#2B6CB0] bg-[#EBF8FF] px-3 py-1 rounded-full border border-[#BEE3F8]">
                      {app.course_category || "通識課程"}
                    </span>
                  </div>
                  {/* 課程名稱（深色粗體） */}
                  <div className="font-black text-[#2D3748] text-lg pt-1">{app.course_name}</div>
                  {/* 教師姓名 */}
                  <div className="text-xs text-[#718096] font-bold">
                    授課教師：{app.teacher_name}
                  </div>
                </div>
                
                <div className="bg-[#FFFFF0] border-2 border-[#ECC94B] px-4 py-3 rounded-xl shadow-sm self-end sm:self-center flex flex-col sm:items-end w-full sm:w-auto">
                  <span className="text-xs text-[#718096] font-bold block mb-1">科目代碼</span>
                  <span className="font-mono font-black text-[#1A202C] text-lg tracking-wider select-all cursor-pointer" title="點擊可選取複製">
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