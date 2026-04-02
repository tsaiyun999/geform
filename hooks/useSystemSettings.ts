// hooks/useSystemSettings.ts
import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

export function useSystemSettings(currentYear: string) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. 讀取特定年度的排程
  const fetchSettings = async (year: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("*")
        .eq("year_name", year)
        .single();

      if (data && !error) {
        // 格式化為 datetime-local 輸入框需要的格式 (YYYY-MM-DDTHH:mm)
        setStartDate(new Date(data.start_date).toISOString().slice(0, 16));
        setEndDate(new Date(data.end_date).toISOString().slice(0, 16));
        
        const now = new Date();
        setIsFormOpen(now >= new Date(data.start_date) && now <= new Date(data.end_date));
      } else {
        // 若該年度還沒設定，清空狀態
        setStartDate("");
        setEndDate("");
        setIsFormOpen(false);
      }
    } catch (err) {
      console.error("Fetch Settings Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 更新排程時間
  const updateSchedule = async (newStart: string, newEnd: string) => {
    const { error } = await supabase
      .from("system_settings")
      .update({ start_date: newStart, end_date: newEnd })
      .eq("year_name", currentYear);

    if (error) {
      alert("更新失敗");
      return false;
    }
    alert(`✅ ${currentYear} 排程已更新！`);
    await fetchSettings(currentYear);
    return true;
  };

  // 3. 手動強制開關 (透過調整時間)
  const toggleFormStatus = async () => {
    const targetDate = isFormOpen 
      ? new Date(new Date().setDate(new Date().getDate() - 1)).toISOString() // 設為昨天 (關閉)
      : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(); // 設為下個月 (開啟)

    const { error } = await supabase
      .from("system_settings")
      .update({
        [isFormOpen ? "end_date" : "start_date"]: targetDate,
        ...(isFormOpen ? {} : { end_date: targetDate }) 
      })
      .eq("year_name", currentYear);

    if (!error) {
      alert(isFormOpen ? `🛑 ${currentYear} 已手動關閉` : `✅ ${currentYear} 已手動開啟`);
      await fetchSettings(currentYear);
    }
  };

  // 當年度切換時自動重新抓取
  useEffect(() => {
    fetchSettings(currentYear);
  }, [currentYear]);

  return {
    startDate,
    endDate,
    isFormOpen,
    isLoading,
    setStartDate,
    setEndDate,
    updateSchedule,
    toggleFormStatus,
    fetchSettings
  };
}