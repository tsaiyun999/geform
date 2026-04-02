// utils/excelHelper.ts
import { Application } from "@/components/ApplicationTable";

/**
 * 下載申請資料為 Excel (CSV) 格式
 * @param applications 要下載的原始資料陣列
 * @param yearName 當前選中的學年度 (用於檔名)
 */
export const downloadApplicationsAsCsv = (applications: Application[], yearName: string) => {
  if (applications.length === 0) {
    alert(`目前沒有 ${yearName} 的任何資料可以下載！`);
    return;
  }

  // 1. 排序邏輯：學期 -> 部別 -> 課程類別
  const sortedApps = [...applications].sort((a, b) => {
    if (a.semester !== b.semester) return a.semester.localeCompare(b.semester);
    if (a.division !== b.division) return a.division.localeCompare(b.division);
    return a.category.localeCompare(b.category);
  });

  // 2. 定義標題列
  const headers = [
    "系統編號", "送件日期", "學期", "部別", "授課教師", 
    "手機號碼", "電子信箱", "科目代碼", "課程名稱", "課程類別", 
    "開設情形", "校區", "上課時間", "電腦教室", "審核狀態"
  ];

  // 3. 處理內容資料 (處理引號防止 CSV 格式跑掉)
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

  // 4. 組合 CSV 內容
  const csvContent = [
    headers.join(","), 
    ...rows.map(row => row.join(","))
  ].join("\n");

  // 5. 下載檔案 (加入 UTF-8 BOM 避免 Excel 開啟時亂碼)
  const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([bom, csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  const today = new Date().toISOString().split('T')[0];
  link.setAttribute("href", url);
  link.setAttribute("download", `聯大通識_${yearName}_申請清單_${today}.csv`);
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};