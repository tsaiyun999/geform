"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import ExcelImporter from "@/components/ExcelImporter";

export default function PastCoursesManager() {
  // 🔐 登入防護狀態
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // 📊 資料列表狀態
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 📍 1. 驗證與 Session 檢查
  useEffect(() => {
    const isLogged = sessionStorage.getItem("adminAuth") === "true";
    if (isLogged) setIsAuthenticated(true);
    setIsCheckingSession(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true");
    } else {
      setErrorMsg("密碼錯誤，請重新輸入！🍭");
      setPasswordInput("");
    }
  };

  // 📍 2. 資料抓取邏輯
  const fetchData = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("past_courses")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setList(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleClearAll = async () => {
    if (!confirm("確定要清空『所有』歷年紀錄嗎？😱")) return;
    setLoading(true);
    const { error } = await supabase.from("past_courses").delete().neq("id", "00000000-0000-0000-0000-000000000000"); 
    if (!error) {
      alert("已清空！✨");
      setList([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定移除嗎？🍭")) return;
    const { error } = await supabase.from("past_courses").delete().eq("id", id);
    if (!error) fetchData();
  };

  // 🔒 檢查狀態中
  if (isCheckingSession) return <div className="min-h-screen bg-[#FFF5F7]"></div>;

  // 🔒 顯示馬卡龍登入畫面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] p-4 font-sans">
        <div className="bg-[#FEFDFB] p-10 rounded-3xl shadow-xl max-w-sm w-full border border-[#F1E4E8] text-center">
          <div className="mb-8">
            <div className="w-20 h-20 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFF3B0]">
              <span className="text-5xl">🛡️</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#604D53]">管理者驗證</h1>
            <p className="text-[#8A767C] text-sm mt-2">請輸入密碼以管理歷年資料庫</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="password"
              placeholder="••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-[#FFF0F3] border border-[#F9D5E5] rounded-xl px-4 py-4 text-[#604D53] focus:outline-none focus:ring-2 focus:ring-[#B8E2F2] text-center tracking-[0.5em] text-xl"
              required
              autoFocus
            />
            {errorMsg && <p className="text-[#FF9E7D] text-sm font-medium">{errorMsg}</p>}
            <button type="submit" className="w-full bg-[#F9D5E5] hover:bg-[#F2B6D2] text-[#604D53] font-bold py-4 rounded-xl shadow-md transition-all active:scale-95">
              進入系統
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ✅ 驗證成功：顯示管理介面
  return (
    <div className="p-10 bg-[#FEFDFB] min-h-screen text-[#604D53] font-sans">
      <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-[#604D53]">📚 歷年開課資料管理</h1>
          <p className="text-[#8A767C] mt-2 font-medium">目前的資料庫共有 <span className="text-[#B8E2F2] font-bold">{list.length}</span> 筆紀錄</p>
        </div>
        <button 
          onClick={handleClearAll}
          className="bg-[#FFD1BA] text-[#A1502B] px-6 py-3 rounded-2xl font-bold text-sm border border-[#FFB38A] hover:bg-[#FFB38A] hover:text-white transition-all shadow-md active:scale-95"
        >
          🗑️ 一鍵清空所有資料
        </button>
      </div>

      <ExcelImporter onUploadSuccess={fetchData} />

      <div className="rounded-[2.5rem] border border-[#D0EFFF] bg-white shadow-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F0F9FF] text-[#1A365D]">
            <tr>
              <th className="p-6 font-black">教師姓名</th>
              <th className="p-6 font-black">課程類別</th>
              <th className="p-6 font-black">課程名稱</th>
              <th className="p-6 font-black">科目代碼</th>
              <th className="p-6 text-center font-black">管理</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E1EFFE]">
            {loading ? (
              <tr><td colSpan={5} className="p-20 text-center animate-pulse">同步中... 🍦</td></tr>
            ) : (
              list.map((item) => (
                <tr key={item.id} className="hover:bg-[#FFFBEB] transition-colors">
                  <td className="p-6 font-bold">{item.teacher_name}</td>
                  <td className="p-6">
                    <span className="bg-[#FFF0F3] text-[#A66170] px-3 py-1 rounded-full text-xs font-bold border border-[#F9D5E5]">
                      {item.course_category}
                    </span>
                  </td>
                  <td className="p-6 font-medium">{item.course_name}</td>
                  <td className="p-6">
                    <span className="bg-[#EBF8FF] text-[#2B6CB0] px-4 py-2 rounded-xl border border-[#BEE3F8] font-mono font-black">
                      {item.course_code}
                    </span>
                  </td>
                  <td className="p-6 text-center">
                    <button onClick={() => handleDelete(item.id)} className="text-[#FF9E7D] font-bold hover:underline">移除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}