"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import Sidebar from "@/components/DashboardSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import ApplicationTable, { Application } from "@/components/ApplicationTable";

export default function DashboardPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [currentYear, setCurrentYear] = useState("116學年度"); // 📍 新增：紀錄當前選中的年度
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(true);

  // 1. 讀取特定年度的「申請資料」
  const fetchApplications = async (year: string) => {
    // 💡 注意：這需要在 applications 表格中有一個 year_name 欄位，或根據 semester 的前三碼過濾
    // 這裡我們暫時抓取全部，但在顯示時進行過濾，或是直接在 Query 時過濾
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      // .eq("year_name", year) // 如果資料庫有這欄位，取消註解這行
      .order("id", { ascending: false });

    if (error) {
      console.error("讀取資料失敗:", error);
    } else {
      // 📍 暫時性邏輯：如果資料庫還沒有 year_name 欄位，我們用學期字串來過濾 (例如 116 開頭的)
      const filtered = data?.filter(app => app.semester.startsWith(year.substring(0,3))) || [];
      setApplications(filtered);
    }
  };

  // 2. 讀取特定年度的「排程設定」
  const fetchSettings = async (year: string) => {
    const { data, error } = await supabase
      .from("system_settings")
      .select("*")
      .eq("year_name", year)
      .single();

    if (data && !error) {
      setStartDate(new Date(data.start_date).toISOString().slice(0, 16));
      setEndDate(new Date(data.end_date).toISOString().slice(0, 16));
      
      // 判斷按鈕狀態 (UI 同步用)
      const now = new Date();
      setIsFormOpen(now >= new Date(data.start_date) && now <= new Date(data.end_date));
    } else {
      // 如果該年度剛新增，還沒設定時間，給予空白
      setStartDate("");
      setEndDate("");
      setIsFormOpen(false);
    }
  };

  // 📍 監聽年度切換：當 Sidebar 切換年度時，重新抓取所有資料
  useEffect(() => {
    fetchApplications(currentYear);
    fetchSettings(currentYear);
  }, [currentYear]);

  // 3. 更新設定的邏輯 (存入特定年度)
  const updateSchedule = async () => {
    const { error } = await supabase
      .from("system_settings")
      .update({
        start_date: startDate,
        end_date: endDate
      })
      .eq("year_name", currentYear); // 📍 確保更新的是正確的年度
    
    if (error) alert("更新失敗");
    else alert(`✅ ${currentYear} 排程已更新！`);
  };

  // 4. 手動開關 (修改特定年度的時間)
  const toggleFormStatus = async () => {
    const targetDate = isFormOpen 
      ? new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() // 設為昨天
      : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(); // 設為下個月

    const { error } = await supabase
      .from("system_settings")
      .update({
        [isFormOpen ? "end_date" : "start_date"]: targetDate,
        ...(isFormOpen ? {} : { end_date: targetDate }) // 如果是開啟，順便把結束日期往後延
      })
      .eq("year_name", currentYear);

    if (!error) {
      alert(isFormOpen ? `🛑 ${currentYear} 已手動關閉` : `✅ ${currentYear} 已手動開啟`);
      fetchSettings(currentYear);
    }
  };

  // --- 以下 Excel、刪除、狀態更新邏輯維持不變，但資料來源已受 currentYear 過濾 ---
  // 5. 下載 Excel (CSV) 邏輯
  const handleDownloadExcel = () => {
    if (applications.length === 0) {
      alert(`目前沒有 ${currentYear} 的任何資料可以下載！`);
      return;
    }

    // 依照需求進行多維度排序：學期 -> 部別 -> 開設情形 -> 課程類別
    const sortedApps = [...applications].sort((a, b) => {
      if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
      if (a.division !== b.division) return a.division.localeCompare(b.division);
      return a.category.localeCompare(b.category);
    });

    const headers = [
      "系統編號", "送件日期", "學期", "部別", "授課教師", 
      "手機號碼", "電子信箱", "科目代碼", "課程名稱", "課程類別", 
      "開設情形", "校區", "上課時間", "電腦教室", "審核狀態"
    ];

    const rows = sortedApps.map(app => [
      app.id, 
      app.submit_date, 
      app.semester, 
      app.division, 
      app.teacher,
      `"${app.phone || '未提供'}"`, 
      `"${app.email || '未提供'}"`,  
      `"${app.course_code}"`, 
      `"${app.course}"`, 
      `"${app.category || '未填寫'}"`, 
      app.type, 
      app.campus,  
      app.time, 
      app.pc || '否', 
      app.status
    ]);

    // 組合 CSV 內容
    const csvContent = [
      headers.join(","), 
      ...rows.map(row => row.join(","))
    ].join("\n");

    // 下載檔案 (UTF-8 BOM 確保 Excel 中文不亂碼)
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    // 📍 檔名加入 currentYear
    link.setAttribute("download", `聯大通識_${currentYear}_申請清單_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  // 6. 刪除資料邏輯
  const handleDelete = async (id: number) => {
    const targetApp = applications.find(a => a.id === id);
    const confirmMsg = `⚠️ 確定要刪除「${targetApp?.teacher} - ${targetApp?.course}」的申請嗎？\n此動作無法復原！`;
    
    if (window.confirm(confirmMsg)) {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) {
        alert("❌ 刪除失敗，請稍後再試。");
      } else {
        // 從目前的列表中移除，不用重新刷頁面
        setApplications(applications.filter(app => app.id !== id));
      }
    }
  };
  // 7. 更新狀態邏輯 (點擊標籤切換狀態)
  const handleStatusChange = async (id: number, currentStatus: string) => {
    let nextStatus = "審核中";
    if (currentStatus === "審核中") nextStatus = "已通過";
    else if (currentStatus === "已通過") nextStatus = "退回修改";
    else if (currentStatus === "退回修改") nextStatus = "審核中";

    const { error } = await supabase
      .from("applications")
      .update({ status: nextStatus })
      .eq("id", id);

    if (error) {
      alert("❌ 狀態更新失敗");
    } else {
      // 即時更新 UI 狀態
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: nextStatus } : app
      ));
    }
  };

  return (
    <div className="flex min-h-screen font-sans text-gray-200" style={{ backgroundColor: "#121418" }}>
      
      {/* 📍 傳入年度切換功能給 Sidebar */}
      <Sidebar 
        currentYear={currentYear} 
        onYearChange={(year) => setCurrentYear(year)} 
      />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* 顯示目前管理年度標籤 */}
        <div className="mb-4 inline-block bg-[#5DADE2]/10 text-[#5DADE2] px-3 py-1 rounded-full text-xs font-bold border border-[#5DADE2]/20">
          📍 正在管理：{currentYear}
        </div>

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