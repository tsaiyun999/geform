"use client";

import React from "react";

// 👇 將資料格式定義搬到這裡，並 export 出去讓主程式也能用
export interface Application {
  id: number;
  teacher: string;
  semester: string;
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

// 👇 定義這個表格積木需要接收哪些東西
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
    <div className="rounded-xl border border-gray-800 bg-[#1A1D21] shadow-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300 border-collapse">
          <thead className="bg-[#0B0D10] text-gray-100">
            <tr>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">送件日期</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">教師資訊 (聯絡方式)</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">課程名稱</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">科目代碼</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">課程類別</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">校區 / 時間 / 電腦教室</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider text-center">審核狀態</th>
              <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider text-center">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-16 text-center text-gray-500 font-medium">
                  <div className="text-6xl mb-4">📭</div>
                  目前尚未收到任何雲端申請。
                </td>
              </tr>
            ) : (
              applications.map((app) => (
                <tr key={app.id} className="even:bg-[#16181C] odd:bg-[#1A1D21] hover:bg-[#22262B] transition-colors">
                  <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap border-r border-gray-800/50">{app.submit_date}</td>
                  <td className="px-5 py-4 whitespace-nowrap border-r border-gray-800/50">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-base">{app.teacher}</span>
                        <span className="font-medium text-gray-100">{app.division} | {app.campus}校區</span> <br/>
                      </div>
                      <span className="text-xs text-gray-400">📞 {app.phone || '未提供'}</span>
                      <span className="text-xs text-gray-400">✉️ {app.email || '未提供'}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 border-r border-gray-800/50">
                    <span className="block font-bold text-[#5DADE2] text-base">{app.course}</span>
                    <span className="inline-block mt-1.5 rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">{app.type}</span>
                  </td>
                  <td className="px-5 py-4 border-r border-gray-800/50">
                    <span className="text-sm font-mono font-medium text-gray-300 bg-gray-800 px-2 py-1 rounded">{app.course_code}</span>
                  </td>
                  <td className="px-5 py-4 border-r border-gray-800/50">
                    <span className="text-xs font-medium text-[#5DADE2] bg-[#102A43] border border-[#243B53] px-2 py-1.5 rounded-md whitespace-nowrap inline-block">{app.category || "未填寫"}</span>
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap border-r border-gray-800/50">
                    <span className="font-medium text-gray-100">{app.campus}校區</span> <br/> 
                    <span className="text-xs text-gray-400">{app.time}</span><br/>
                    <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded ${app.pc === '是' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' : 'bg-gray-800 text-gray-400'}`}>💻 電腦教室: {app.pc || '未提供'}</span>
                  </td>
                  <td className="px-5 py-4 text-center align-middle border-r border-gray-800/50">
                    <button onClick={() => handleStatusChange(app.id, app.status)} className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all hover:scale-105 shadow-md inline-block ${app.status === '已通過' ? 'bg-green-900 text-green-200 border border-green-700' : app.status === '退回修改' ? 'bg-red-900 text-red-200 border border-red-700' : 'bg-[#F39C12] bg-opacity-20 text-[#F39C12] border border-[#F39C12] border-opacity-40'}`}>
                      {app.status} ↺
                    </button>
                  </td>
                  <td className="px-5 py-4 text-center align-middle">
                    <button onClick={() => handleDelete(app.id)} className="rounded-lg bg-red-950 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900 border border-red-800 transition-colors shadow">刪除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-[#0B0D10] h-3 border-t border-gray-800"></div>
    </div>
  );
}