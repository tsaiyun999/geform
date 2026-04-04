import * as XLSX from 'xlsx';
import { Application } from "@/components/ApplicationTable";

/**
 * 將申請資料匯出為多分頁的 Excel (.xlsx) 檔案
 * 分頁包含：116-1, 116-2, 116學年度(全)
 */
export const downloadApplicationsAsExcel = (applications: Application[], yearName: string) => {
  if (applications.length === 0) {
    alert(`目前沒有 ${yearName} 的任何資料可以下載！`);
    return;
  }

  // 1. 準備三個分頁的原始資料
  const semester1Data = applications.filter(app => app.semester.includes("第1學期"));
  const semester2Data = applications.filter(app => app.semester.includes("第2學期"));
  const allData = [...applications].sort((a, b) => a.semester.localeCompare(b.semester));

  // 2. 建立新的活頁簿 (Workbook)
  const workbook = XLSX.utils.book_new();

  // 3. 定義統一的資料格式化函數 (轉換成中文欄位)
  const formatForExcel = (data: Application[]) => {
    return data.map((app, index) => ({
      "序號": index + 1,
      "送件日期": app.submit_date,
      "開課學期": app.semester,
      "部別": app.division,
      "授課教師": app.teacher,
      "手機號碼": app.phone || '未提供',
      "電子信箱": app.email || '未提供',
      "科目代碼": app.course_code,
      "課程名稱": app.course,
      "課程類別": app.category || '未填寫',
      "開設情形": app.type,
      "校區": app.campus,
      "上課時間": app.time,
      "電腦教室": app.pc || '否',
      "審核狀態": app.status
    }));
  };

  // 4. 轉換資料並加入分頁
  // 分頁 1: 第 1 學期
  const ws1 = XLSX.utils.json_to_sheet(formatForExcel(semester1Data));
  XLSX.utils.book_append_sheet(workbook, ws1, `${yearName.replace("學年度", "")}-1`);

  // 分頁 2: 第 2 學期
  const ws2 = XLSX.utils.json_to_sheet(formatForExcel(semester2Data));
  XLSX.utils.book_append_sheet(workbook, ws2, `${yearName.replace("學年度", "")}-2`);

  // 分頁 3: 全學年度
  const wsAll = XLSX.utils.json_to_sheet(formatForExcel(allData));
  XLSX.utils.book_append_sheet(workbook, wsAll, `${yearName}(全)`);

  // 5. 設定欄位寬度 (wch 代表字元數，讓表格比較好讀)
  const wscols = [
    { wch: 6 }, { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 10 },
    { wch: 15 }, { wch: 25 }, { wch: 12 }, { wch: 25 }, { wch: 20 },
    { wch: 12 }, { wch: 10 }, { wch: 20 }, { wch: 10 }, { wch: 10 }
  ];
  ws1['!cols'] = wscols;
  ws2['!cols'] = wscols;
  wsAll['!cols'] = wscols;

  // 6. 產生檔案並下載
  const today = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `聯大通識_${yearName}_申請彙整表_${today}.xlsx`);
};