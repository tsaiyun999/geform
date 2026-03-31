"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

// 👇 引入我們所有的積木，並從表格積木中拿回 Application 的格式定義
import Sidebar from "@/components/Sidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // 1. 讀取資料邏輯
  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("讀取資料失敗:", error);
      alert("❌ 無法連線到資料庫，請重新整理頁面。");
    } else {
      setApplications(data || []);
    }
  };
  // 讀取設定的邏輯
const fetchSettings = async () => {
  const { data } = await supabase.from("system_settings").select("*").single();
  if (data) {
    // 轉換為 input type="datetime-local" 需要的格式
    setStartDate(new Date(data.start_date).toISOString().slice(0, 16));
    setEndDate(new Date(data.end_date).toISOString().slice(0, 16));
  }
};

// 更新設定的邏輯
const updateSchedule = async () => {
  const { error } = await supabase.from("system_settings").update({
    start_date: startDate,
    end_date: endDate
  }).eq("id", 1);
  
  if (error) alert("更新失敗");
  else alert("✅ 自動排程已更新！系統將在設定時間內自動開放。");
};
  useEffect(() => {
    fetchApplications();
    const formStatus = localStorage.getItem("nuu_form_status");
    if (formStatus === "closed") setIsFormOpen(false);
  }, []);

  // 2. 切換表單狀態邏輯
  const toggleFormStatus = () => {
    const newStatus = !isFormOpen;
    setIsFormOpen(newStatus);
    if (newStatus) {
      localStorage.setItem("nuu_form_status", "open");
      alert("✅ 系統已開放！老師們現在可以填寫申請表單了。");
    } else {
      localStorage.setItem("nuu_form_status", "closed");
      alert("🛑 系統已關閉！前台表單已隱藏，無法再送出新申請。");
    }
  };

  // 3. 下載 Excel 邏輯
  const handleDownloadExcel = () => {
    if (applications.length === 0) {
      alert("目前沒有任何資料可以下載！");
      return;
    }

    // 1. 依照需求 (16) 進行多維度排序：
    // 排序優先級：學期 -> 部別 -> 開設情形 (曾/新) -> 課程類別
    const sortedApps = [...applications].sort((a, b) => {
      if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
      if (a.division !== b.division) return a.division.localeCompare(b.division);
      if (a.type !== b.type) return b.type.localeCompare(a.type); // 曾開設 vs 新開設
      return a.category.localeCompare(b.category);
    });

    // 2. 定義 Excel 欄位 (將部別與校區分開)
    const headers = [
      "系統編號", "送件日期", "學期", "部別", "授課教師", 
      "手機號碼", "電子信箱", "科目代碼", "課程名稱", "課程類別", 
      "開設情形", "校區", "上課時間", "電腦教室", "審核狀態"
    ];

    // 3. 準備資料列
    const rows = sortedApps.map(app => [
      app.id, 
      app.submit_date, 
      app.semester, 
      app.division, // 📍 獨立欄位：部別
      app.teacher,
      `"${app.phone || '未提供'}"`, 
      `"${app.email || '未提供'}"`,  
      `"${app.course_code}"`, 
      `"${app.course}"`, 
      `"${app.category || '未填寫'}"`, 
      app.type, 
      app.campus,   // 📍 獨立欄位：校區
      app.time, 
      app.pc || '未提供', 
      app.status
    ]);

    // 4. 統計各項開課資訊 (需求 16)
    const stats = {
      total: sortedApps.length,
      day: sortedApps.filter(a => a.division === "日間部").length,
      night: sortedApps.filter(a => a.division === "進修部").length,
      new: sortedApps.filter(a => a.type === "新開設課程").length,
      old: sortedApps.filter(a => a.type === "曾開設課程").length,
    };

    const statsRow = [
      "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
    ];
    const summaryHeader = ["統計資訊", `總計: ${stats.total}`, `日間部: ${stats.day}`, `進修部: ${stats.night}`, `新課程: ${stats.new}`, `舊課程: ${stats.old}`];

    // 5. 組合 CSV 內容
    const csvContent = [
      summaryHeader.join(","), // 最上方放統計摘要
      "",                      // 空一行
      headers.join(","), 
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 6. 下載檔案 (UTF-8 BOM 確保 Excel 中文不亂碼)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `聯大通識開課申請表_統計版_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 4. 刪除資料邏輯
  const handleDelete = async (id: number) => {
    if (window.confirm("⚠️ 確定要刪除這筆開課申請嗎？刪除後無法復原。")) {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) alert("❌ 刪除失敗，請稍後再試。");
      else setApplications(applications.filter(app => app.id !== id));
    }
  };

  // 5. 更新狀態邏輯
  const handleStatusChange = async (id: number, currentStatus: string) => {
    let nextStatus = "審核中";
    if (currentStatus === "審核中") nextStatus = "已通過";
    else if (currentStatus === "已通過") nextStatus = "退回修改";

    const { error } = await supabase.from("applications").update({ status: nextStatus }).eq("id", id);
    if (error) alert("❌ 狀態更新失敗，請稍後再試。");
    else setApplications(applications.map(app => app.id === id ? { ...app, status: nextStatus } : app));
  };


  return (
    <div className="flex min-h-screen font-sans text-gray-200" style={{ backgroundColor: "#121418" }}>
      
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        
        <DashboardHeader 
          applicationsCount={applications.length} 
          isFormOpen={isFormOpen} 
          toggleFormStatus={toggleFormStatus} 
          handleDownloadExcel={handleDownloadExcel} 
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
          updateSchedule={updateSchedule}
        />

        <ApplicationTable 
          applications={applications} 
          handleStatusChange={handleStatusChange} 
          handleDelete={handleDelete} 
        />
      </main>
    </div>
  );
}