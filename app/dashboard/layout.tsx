"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // 1. 檢查 sessionStorage 是否已經登入過
  useEffect(() => {
    const isLogged = sessionStorage.getItem("adminAuth") === "true";
    if (isLogged) {
      setIsAuthenticated(true);
    }
    setIsCheckingSession(false);
  }, []);

  // 2. 處理登入邏輯
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem("adminAuth", "true"); // 記住登入狀態
    } else {
      setErrorMsg("密碼錯誤，請重新輸入！");
      setPasswordInput("");
    }
  };

  // 🔒 還在檢查時顯示防閃爍背景
  if (isCheckingSession) {
    return <div className="min-h-screen bg-[#FFF5F7]"></div>;
  }

  // 🔒 如果尚未登入，顯示你原本漂亮的登入畫面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF5F7] p-4 font-sans">
        <div className="bg-[#FEFDFB] p-10 rounded-3xl shadow-xl max-w-sm w-full border border-[#F1E4E8]">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#FFFBEB] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#FFF3B0]">
              <span className="text-5xl block">🛡️</span>
            </div>
            
            <h1 className="text-2xl font-extrabold text-[#604D53] tracking-tight">通識中心後台管理</h1>
            <p className="text-[#8A767C] text-sm mt-2 font-medium">請輸入密碼進入系統</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <input
                type="password"
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setErrorMsg("");
                }}
                className="w-full bg-[#FFF0F3] border border-[#F9D5E5] rounded-xl px-4 py-4 text-[#604D53] focus:outline-none focus:ring-2 focus:ring-[#B8E2F2] focus:bg-white focus:border-[#B8E2F2] transition-all text-center tracking-[0.5em] text-xl placeholder:tracking-normal placeholder:text-[#C4B5B9]"
                required
                autoFocus
              />
              {errorMsg && <p className="text-[#FF9E7D] text-sm mt-2.5 text-center font-medium">{errorMsg}</p>}
            </div>
            
            <button 
              type="submit"
              className="w-full bg-[#F9D5E5] hover:bg-[#F2B6D2] text-[#604D53] font-bold py-4 rounded-xl transition-all shadow-md hover:shadow-lg hover:shadow-[#F9D5E5]/30 active:scale-95"
            >
              登入系統
            </button>
          </form>
          
          <p className="mt-8 text-center text-[#C4B5B9] text-xs font-medium">
            國立聯合大學 通識教育中心
          </p>
        </div>
      </div>
    );
  }

  // ✅ 通過驗證後，渲染該 dashboard 底下的所有頁面內容
  return <>{children}</>;
}