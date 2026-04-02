// hooks/useApplications.ts
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";
import { Application } from "@/components/ApplicationTable";

export function useApplications(currentYear: string) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // 1. 讀取特定年度的「申請資料」
  const fetchApplications = async (year: string) => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("讀取資料失敗:", error);
      } else {
        // 暫時性邏輯：根據學期字串過濾 (例如 116 開頭的)
        const filtered = data?.filter(app => app.semester.startsWith(year.substring(0, 3))) || [];
        setApplications(filtered);
      }
    } finally {
      setIsFetching(false);
    }
  };

  // 2. 刪除資料邏輯
  const deleteApplication = async (id: number) => {
    const targetApp = applications.find(a => a.id === id);
    const confirmMsg = `⚠️ 確定要刪除「${targetApp?.teacher} - ${targetApp?.course}」的申請嗎？\n此動作無法復原！`;
    
    if (window.confirm(confirmMsg)) {
      const { error } = await supabase.from("applications").delete().eq("id", id);
      if (error) {
        alert("❌ 刪除失敗");
        return false;
      } else {
        setApplications(prev => prev.filter(app => app.id !== id));
        return true;
      }
    }
    return false;
  };

  // 3. 更新狀態邏輯 (循環切換)
  const updateApplicationStatus = async (id: number, currentStatus: string) => {
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
      return false;
    } else {
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status: nextStatus } : app
      ));
      return true;
    }
  };

  // 監聽年度切換
  useEffect(() => {
    fetchApplications(currentYear);
  }, [currentYear]);

  return {
    applications,
    isFetching,
    fetchApplications,
    deleteApplication,
    updateApplicationStatus
  };
}