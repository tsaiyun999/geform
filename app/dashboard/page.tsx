"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// 👇 加入 pc, phone, email
interface Application {
  id: number;
  teacher: string;
  semester: string;
  course: string;
  courseCode: string; 
  category: string; 
  type: string;
  campus: string;
  time: string;
  pc: string;       // 新增：電腦教室
  phone: string;    // 新增：手機號碼
  email: string;    // 新增：電子信箱
  submitDate: string;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("nuu_applications") || "[]");
    setApplications(savedData);
  }, []);

  // 匯出功能 (將所有欄位獨立成行，包含手機與信箱)
  const handleDownloadExcel = () => {
    if (applications.length === 0) {
      alert("目前沒有任何資料可以下載！");
      return;
    }

    // 👇 標題新增手機號碼、電子信箱、電腦教室
    const headers = ["系統編號", "送件日期", "學期", "教師姓名", "手機號碼", "電子信箱", "科目代碼", "課程名稱", "課程類別", "開設情形", "校區", "上課時間", "電腦教室", "審核狀態"];

    const rows = applications.map(app => [
      app.id,
      app.submitDate,
      app.semester,
      app.teacher,
      `"${app.phone || '未提供'}"`,  // 預防舊資料沒有手機
      `"${app.email || '未提供'}"`,  // 預防舊資料沒有信箱
      `"${app.courseCode}"`, 
      `"${app.course}"`, 
      `"${app.category || '未填寫'}"`, 
      app.type,
      app.campus,
      app.time,
      app.pc || '未提供',
      app.status
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `聯大通識開課申請表_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("⚠️ 確定要刪除這筆開課申請嗎？刪除後無法復原。")) {
      const updatedApps = applications.filter(app => app.id !== id);
      setApplications(updatedApps);
      localStorage.setItem("nuu_applications", JSON.stringify(updatedApps));
    }
  };

  const handleStatusChange = (id: number) => {
    const updatedApps = applications.map(app => {
      if (app.id === id) {
        let nextStatus = "審核中";
        if (app.status === "審核中") nextStatus = "已通過";
        else if (app.status === "已通過") nextStatus = "退回修改";
        return { ...app, status: nextStatus };
      }
      return app;
    });
    setApplications(updatedApps);
    localStorage.setItem("nuu_applications", JSON.stringify(updatedApps));
  };

  const handleLogout = () => {
    if (window.confirm("確定要登出系統嗎？")) {
      router.push("/");
    }
  };

  return (
    <div className="flex min-h-screen font-sans text-gray-200" style={{ backgroundColor: "#121418" }}>
      
      <aside className="w-64 flex-col bg-[#0B0D10] text-white flex shadow-2xl border-r border-gray-800">
        <div className="border-b border-gray-800 p-6 text-xl font-bold tracking-wider text-center text-[#5DADE2]">
          通識中心後台
        </div>
        <nav className="flex-1 space-y-2 p-4">
          <Link href="/dashboard" className="block rounded-md bg-[#1A1D21] px-4 py-3 font-medium text-white shadow-md border border-gray-700">
            📋 開課申請管理
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-800 bg-[#08090B]">
          <button onClick={handleLogout} className="block w-full rounded-md border border-gray-700 px-4 py-2 text-center text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white">
            登出系統
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-white tracking-tight">資料管理面板</h1>
            <p className="mt-3 text-lg text-gray-400">
              目前共有 <span className="font-bold text-[#5DADE2]">{applications.length}</span> 筆申請資料。
            </p>
          </div>
          
          <button 
            onClick={handleDownloadExcel}
            className="mt-5 md:mt-0 flex items-center justify-center rounded-lg bg-[#2ECC71] px-8 py-3 font-bold text-white shadow-lg transition-all hover:bg-[#27AE60] hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            📥 匯出 Excel 總表 (CSV)
          </button>
        </header>

        <div className="rounded-xl border border-gray-800 bg-[#1A1D21] shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300 border-collapse">
              <thead className="bg-[#0B0D10] text-gray-100">
                <tr>
                  <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">送件日期</th>
                  {/* 👇 變更標題：整合教師聯絡資訊 */}
                  <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">教師資訊 (聯絡方式)</th>
                  <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">課程名稱</th>
                  <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">科目代碼</th>
                  <th className="border-b border-gray-800 px-5 py-4 font-bold tracking-wider">課程類別</th>
                  {/* 👇 變更標題：整合電腦教室 */}
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
                      目前尚未收到任何開課申請。
                    </td>
                  </tr>
                ) : (
                  [...applications].reverse().map((app, index) => (
                    <tr key={app.id} className="even:bg-[#16181C] odd:bg-[#1A1D21] hover:bg-[#22262B] transition-colors">
                      <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap border-r border-gray-800/50">
                        {app.submitDate}
                      </td>
                      
                      {/* 👇 群組化的「教師資訊」區塊：姓名、學期、電話、信箱 */}
                      <td className="px-5 py-4 whitespace-nowrap border-r border-gray-800/50">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{app.teacher}</span>
                            <span className="text-xs text-gray-400 rounded bg-[#2C3E50] px-1.5 py-0.5">{app.semester}</span>
                          </div>
                          <span className="text-xs text-gray-400">📞 {app.phone || '未提供'}</span>
                          <span className="text-xs text-gray-400">✉️ {app.email || '未提供'}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4 border-r border-gray-800/50">
                        <span className="block font-bold text-[#5DADE2] text-base">{app.course}</span>
                        <span className="inline-block mt-1.5 rounded bg-gray-700 px-2 py-0.5 text-xs text-gray-300">
                          {app.type}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-r border-gray-800/50">
                        <span className="text-sm font-mono font-medium text-gray-300 bg-gray-800 px-2 py-1 rounded">
                          {app.courseCode}
                        </span>
                      </td>
                      <td className="px-5 py-4 border-r border-gray-800/50">
                        <span className="text-xs font-medium text-[#5DADE2] bg-[#102A43] border border-[#243B53] px-2 py-1.5 rounded-md whitespace-nowrap inline-block">
                          {app.category || "未填寫"}
                        </span>
                      </td>

                      {/* 👇 群組化的「時地資訊」區塊：校區、時間、電腦教室 */}
                      <td className="px-5 py-4 whitespace-nowrap border-r border-gray-800/50">
                        <span className="font-medium text-gray-100">{app.campus}校區</span> 
                        <br/> 
                        <span className="text-xs text-gray-400">{app.time}</span>
                        <br/>
                        {/* 根據是否需要電腦教室，呈現不同顏色的標籤 */}
                        <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded ${app.pc === '是' ? 'bg-blue-900/50 text-blue-300 border border-blue-800/50' : 'bg-gray-800 text-gray-400'}`}>
                          💻 電腦教室: {app.pc || '未提供'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-center align-middle border-r border-gray-800/50">
                        <button 
                          onClick={() => handleStatusChange(app.id)}
                          className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all hover:scale-105 shadow-md inline-block
                            ${app.status === '已通過' ? 'bg-green-900 text-green-200 border border-green-700' : 
                              app.status === '退回修改' ? 'bg-red-900 text-red-200 border border-red-700' : 
                              'bg-[#F39C12] bg-opacity-20 text-[#F39C12] border border-[#F39C12] border-opacity-40'}`}
                        >
                          {app.status} ↺
                        </button>
                      </td>
                      <td className="px-5 py-4 text-center align-middle">
                        <button 
                          onClick={() => handleDelete(app.id)} 
                          className="rounded-lg bg-red-950 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-900 border border-red-800 transition-colors shadow"
                        >
                          刪除
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-[#0B0D10] h-3 border-t border-gray-800"></div>
        </div>
      </main>
    </div>
  );
}