"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "@/utils/supabase";

export default function ExcelImporter({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        // 📍 使用 cellNF 確保格式讀取更精確
        const wb = XLSX.read(bstr, { type: "binary", cellNF: true });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // 將 Excel 轉為 JSON 陣列
        const data = XLSX.utils.sheet_to_json(ws);

        // 📍 強化版格式化邏輯
        const formattedData = data.map((row: any) => {
          // 定義一個內部函式來尋找標題
          // keywords：我們接受的各種可能標題名稱
          const findValue = (keywords: string[]) => {
            const key = Object.keys(row).find(k => 
              keywords.some(kw => 
                // 剔除所有空白與換行後進行部分匹配
                k.toString().replace(/\s+/g, "").includes(kw)
              )
            );
            return key ? row[key]?.toString().trim() : "";
          };

          return {
            teacher_name: findValue(["教師", "姓名"]),
            course_category: findValue(["類別", "課程類別"]),
            course_name: findValue(["名稱", "課程名稱"]),
            course_code: findValue(["代碼", "科目代碼"]),
          };
        }).filter(item => item.teacher_name && item.course_code); // 只要有姓名跟代碼就匯入

        if (formattedData.length === 0) {
          alert("Excel 內容格式不符，請檢查第一列的標題是否正確！🍬\n需要包含：教師姓名、課程類別、課程名稱、科目代碼");
          setIsImporting(false);
          return;
        }

        // 整批寫入 Supabase
        const { error } = await supabase.from("past_courses").insert(formattedData);

        if (error) throw error;

        alert(`成功匯入 ${formattedData.length} 筆資料！✨`);
        onUploadSuccess(); 
      } catch (err: any) {
        alert("匯入失敗：" + err.message);
      } finally {
        setIsImporting(false);
        e.target.value = ""; 
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="mb-8">
      <label className="relative group cursor-pointer">
        <div className={`
          flex flex-col items-center justify-center p-8 rounded-[2rem] border-2 border-dashed transition-all
          ${isImporting 
            ? "bg-[#FFFBEB] border-[#FFF3B0] animate-pulse" 
            : "bg-[#F0F9FF] border-[#B8E2F2] hover:bg-[#EBF8FF] hover:border-[#3182CE] shadow-sm hover:shadow-md"
          }
        `}>
          <div className="text-4xl mb-3">{isImporting ? "⏳" : "📥"}</div>
          <p className="text-[#604D53] font-black text-lg">
            {isImporting ? "正在餵食雲端資料..." : "點擊或拖曳 Excel 檔案至此"}
          </p>
          <p className="text-[#8A767C] text-xs mt-2 font-medium">
            請確保標題列在第一行，包含：教師姓名、課程類別、課程名稱、科目代碼
          </p>
        </div>
        
        <input 
          type="file" 
          accept=".xlsx, .xls" 
          className="hidden" 
          onChange={handleFileUpload}
          disabled={isImporting}
        />
      </label>
    </div>
  );
}