"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/utils/supabase";

export default function ClosedNotice() {
  const [schedule, setSchedule] = useState<{ start: string; end: string } | null>(null);

  useEffect(() => {
    const fetchSchedule = async () => {
      const { data } = await supabase.from("system_settings").select("*").single();
      if (data) {
        // 格式化日期顯示，例如：2026年02月01日 08:00
        const formatDate = (dateStr: string) => {
          const d = new Date(dateStr);
          return `${d.getFullYear()}年${(d.getMonth() + 1).toString().padStart(2, '0')}月${d.getDate().toString().padStart(2, '0')}日 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        };
        setSchedule({
          start: formatDate(data.start_date),
          end: formatDate(data.end_date)
        });
      }
    };
    fetchSchedule();
  }, []);

  return (
    <div className="py-12 px-6 text-center">
      {/* 📍 視覺圖示：時鐘 */}
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
          ⏳
        </div>
      </div>

      <h2 className="text-2xl font-black text-gray-900 mb-4">
        目前非通識課程開課申請時段
      </h2>
      
      <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
        感謝您的配合。本學期通識課程開課申請採取自動排程系統，請於開放時間內登入填寫。
      </p>

      {/* 📍 顯示自動抓取的開放時間區塊 */}
      {schedule && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8 max-w-sm mx-auto shadow-sm">
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-3">預計開放期程</p>
          <div className="space-y-2 text-blue-900 font-mono font-bold">
            <div>{schedule.start}</div>
            <div className="text-blue-300 text-xs">至</div>
            <div>{schedule.end}</div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-400">如果您需要查詢科目代碼：</p>
        <Link 
          href="/query" 
          className="inline-block bg-white border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-bold py-3 px-10 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-100"
        >
          前往歷年資料查詢系統 →
        </Link>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100 text-xs text-gray-300">
        如有特殊開課需求或疑問，請洽通識教育中心。
      </div>
    </div>
  );
}