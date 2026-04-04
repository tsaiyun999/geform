"use client";

import React from "react";

// 將資料格式定義搬到這裡，並 export 出去讓主程式也能用
export interface Application {
  id: number;
  teacher: string;
  semester: string; // 這裡通常包含 "116學年度第1學期" 這樣的字串
  course: string;
  course_code: string; 
  category: string; 
  type: string;
  division: string;
  campus: string;
  time: string;
  pc: string;       
  phone: string;    
  email: string;    
  submit_date: string;
  status: string;
}

// 定義這個表格積木需要接收哪些東西
interface ApplicationTableProps {
  applications: Application[];
  handleStatusChange: (id: number, currentStatus: string) => void;
  handleDelete: (id: number) => void;
}

export default function ApplicationTable({
  applications,
  handleStatusChange,
  handleDelete
}: ApplicationTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left text-sm text-gray-700 border-collapse">
      {/* 📍 1. 表頭：淺藍色背景 + 深藍色文字 */}
      <thead className="bg-[#F0F7FF] text-[#1A365D]">
        <tr>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">送件日期</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">開課學期</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">教師資訊 (聯絡方式)</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">課程名稱</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">科目代碼</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">課程類別</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider">校區 / 時間 / 電腦</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider text-center">審核狀態</th>
          <th className="border-b border-gray-200 px-5 py-4 font-bold tracking-wider text-center">操作</th>
        </tr>
      </thead>
      
      <tbody className="divide-y divide-gray-100">
        {applications.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-6 py-16 text-center text-gray-400 font-medium bg-white">
              <div className="text-6xl mb-4">📭</div>
              目前尚未收到任何雲端申請。
            </td>
          </tr>
        ) : (
          applications.map((app) => (
            <tr key={app.id} className="even:bg-gray-50 odd:bg-white hover:bg-[#F0F9FF] transition-colors">
              <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap border-r border-gray-100">{app.submit_date}</td>
              
              {/* 📍 2. 學期標籤：藍色亮色風格 (顯示 118-1) */}
              <td className="px-5 py-4 border-r border-gray-100 text-center">
                <span className="text-sm font-bold text-[#2B6CB0] bg-[#EBF8FF] px-2 py-1 rounded border border-[#BEE3F8] whitespace-nowrap">
                  {app.semester.replace("學年度第", "-").replace("學期", "")}
                </span>
              </td>

              <td className="px-5 py-4 whitespace-nowrap border-r border-gray-100">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-base">{app.teacher}</span>
                    <span className="font-medium text-gray-600 text-xs">{app.division}</span>
                  </div>
                  <span className="text-xs text-gray-600">📞 {app.phone || '未提供'}</span>
                  <span className="text-xs text-gray-600">✉️ {app.email || '未提供'}</span>
                </div>
              </td>

              <td className="px-5 py-4 border-r border-gray-100">
                <span className="block font-bold text-[#3182CE] text-base">{app.course}</span>
                <span className="inline-block mt-1.5 rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600 border border-gray-200">{app.type}</span>
              </td>

              <td className="px-5 py-4 border-r border-gray-100">
                <span className="text-sm font-mono font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">{app.course_code}</span>
              </td>

              <td className="px-5 py-4 border-r border-gray-100">
                <span className="text-xs font-medium text-[#2C5282] bg-[#E3F2FD] border border-[#BBDEFB] px-2 py-1.5 rounded-md whitespace-nowrap inline-block">{app.category || "未填寫"}</span>
              </td>

              <td className="px-5 py-4 whitespace-nowrap border-r border-gray-100">
                <span className="font-medium text-gray-800">{app.campus}校區</span> <br/> 
                <span className="text-xs text-gray-600">{app.time}</span><br/>
                <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded ${app.pc === '是' ? 'bg-[#E3F2FD] text-[#1976D2] border border-[#BBDEFB]' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>💻 {app.pc === '是' ? '電腦教室' : '一般教室'}</span>
              </td>

              {/* 📍 3. 審核狀態按鈕：亮色版配色 */}
              <td className="px-5 py-4 text-center align-middle border-r border-gray-100">
                <button onClick={() => handleStatusChange(app.id, app.status)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all hover:scale-105 shadow-sm inline-block ${app.status === '已通過' ? 'bg-[#C6F6D5] text-[#22543D] border border-[#9AE6B4]' : app.status === '退回修改' ? 'bg-[#FED7D7] text-[#822727] border border-[#FEB2B2]' : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'}`}>
                  {app.status} ↺
                </button>
              </td>

              <td className="px-5 py-4 text-center align-middle">
                {/* 📍 4. 刪除按鈕：亮色紅 */}
                <button onClick={() => handleDelete(app.id)} className="rounded-lg bg-[#FFF5F5] px-4 py-2 text-sm font-medium text-[#C53030] hover:bg-[#FED7D7] border border-[#FEB2B2] transition-colors shadow-sm">刪除</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
  {/* 底部修飾條：淺藍色 */}
  <div className="bg-[#F0F7FF] h-3 border-t border-gray-200"></div>
</div>
  );
}