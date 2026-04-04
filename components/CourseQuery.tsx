"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function CourseQuery() {
  const [teacher, setTeacher] = useState("");
  const [result, setResult] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    if (!teacher.trim()) {
      alert("請輸入教師姓名");
      return;
    }
    setLoading(true);
    
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .eq("teacher", teacher.trim())
      .order("semester", { ascending: false });

    if (error) {
      alert("查詢出錯");
    } else if (data && data.length > 0) {
      setResult(data);
    } else {
      alert("查無此教師的紀錄");
      setResult(null);
    }
    setLoading(false);
  };

  return (
    /* 📍 白色小區塊容器：純白背景、大圓角、強烈陰影 */
    <div className="bg-white rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] max-w-2xl mx-auto border border-gray-100">
      
      {/* 標題：改用深色文字 */}
      <h3 className="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2">
        <span className="text-[#3498DB]">🔍</span> 歷年代碼查詢
      </h3>
      <p className="text-gray-500 text-sm mb-8">輸入姓名即可找回科目代碼</p>

      {/* 查詢輸入區 */}
      <div className="space-y-6">
        <div className="form-group">
          <label className="text-gray-700 font-bold text-sm block mb-2">授課教師姓名</label>
          <div className="flex flex-col md:flex-row gap-3">
            <input 
              type="text" 
              value={teacher} 
              onChange={(e) => setTeacher(e.target.value)}
              className="flex-1 bg-gray-50 border-2 border-gray-200 p-3 rounded-xl text-gray-900 focus:border-[#3498DB] focus:bg-white outline-none transition-all placeholder:text-gray-400"
              placeholder="例如：王大明"
            />
            <button 
              onClick={handleQuery}
              disabled={loading}
              className="bg-[#3498DB] hover:bg-[#2980B9] text-white font-bold py-3 px-8 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50"
            >
              {loading ? "處理中..." : "立刻查詢"}
            </button>
          </div>
        </div>

        {/* 查詢結果：在白底上使用淺灰色區塊 */}
        {result && (
          <div className="mt-8 pt-8 border-t border-gray-100 space-y-3">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Search Results</p>
            {result.map((app) => (
              <div key={app.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center group hover:border-[#3498DB] transition-colors">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 block mb-1">{app.semester}</span>
                  <span className="font-bold text-gray-800">{app.course}</span>
                </div>
                <div className="bg-white border border-gray-200 px-3 py-1 rounded-lg shadow-sm">
                  <span className="text-[10px] text-gray-400 block text-right">代碼</span>
                  <span className="font-mono font-bold text-[#3498DB]">{app.course_code}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-300">
        National United University | General Education Center
      </div>
    </div>
  );
}