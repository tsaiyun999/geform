"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import CourseApplicationForm from "@/components/CourseApplicationForm";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function EditPage() {
  const params = useParams();
  const editId = params.id as string;

  const [status, setStatus] = useState("");
  const [correctPhone, setCorrectPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // 📍 新增：控制是否通過驗證
  const [isVerified, setIsVerified] = useState(false);
  const [inputPhone, setInputPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchAppData = async () => {
      const { data } = await supabase
        .from("applications")
        .select("status, phone")
        .eq("id", editId)
        .single();

      if (data) {
        setStatus(data.status);
        setCorrectPhone(data.phone);
      }
      setIsLoading(false);
    };
    fetchAppData();
  }, [editId]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPhone === correctPhone) {
      setIsVerified(true);
    } else {
      setErrorMsg("手機號碼不正確，請重新輸入！");
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">資料讀取中...</div>;
  }

  // 🔒 狀態 1：資料已被管理員鎖定
  if (status === "已通過") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121418] text-white">
        <div className="bg-red-900/30 p-8 rounded-xl border border-red-500 text-center shadow-lg">
          <span className="text-5xl mb-4 block">🔒</span>
          <h2 className="text-2xl font-bold text-red-400 mb-2">此申請已核定通過</h2>
          <p className="text-gray-300 mb-6">已通過的課程無法再次修改。若需調整，請聯繫通識中心管理員。</p>
          <Link href="/" className="bg-gray-700 px-6 py-2 rounded-lg hover:bg-gray-600 transition">返回首頁</Link>
        </div>
      </div>
    );
  }

  // 🔑 狀態 2：尚未驗證，顯示解鎖畫面
  if (!isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#121418] text-white p-4">
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-700">
          <h2 className="text-2xl font-bold text-[#5DADE2] mb-2 flex items-center gap-2">
            <span>🛡️</span> 身分驗證
          </h2>
          <p className="text-gray-400 text-sm mb-6">
            為了保護您的資料安全，請輸入您申請時填寫的<strong className="text-white">手機號碼</strong>以解鎖表單。
          </p>
          
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="例如：0912345678"
                value={inputPhone}
                onChange={(e) => {
                  setInputPhone(e.target.value);
                  setErrorMsg(""); // 輸入時清除錯誤提示
                }}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#5DADE2]"
                required
              />
              {errorMsg && <p className="text-red-400 text-sm mt-2">{errorMsg}</p>}
            </div>
            <button 
              type="submit"
              className="w-full bg-[#5DADE2] hover:bg-[#3498DB] text-white font-bold py-3 rounded-lg transition"
            >
              確認解鎖
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-white underline">取消並返回首頁</Link>
          </div>
        </div>
      </div>
    );
  }

  // 📝 狀態 3：驗證成功，顯示編輯表單
  return (
    <div className="min-h-screen p-8 bg-[#121418]">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#5DADE2] flex items-center gap-2">
            <span>✎</span> 修正課程申請資料
          </h1>
          <Link href="/" className="text-gray-400 hover:text-white underline text-sm">取消並返回首頁</Link>
        </div>
        
        <div className="bg-white p-8 rounded-2xl shadow-xl text-black">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-yellow-800 text-sm">
            <strong>編輯模式解鎖成功：</strong> 您正在修改已提交的資料，修改完成後點擊最下方按鈕即可覆蓋原申請。
          </div>
          <CourseApplicationForm targetEditId={editId} />
        </div>
      </div>
    </div>
  );
}