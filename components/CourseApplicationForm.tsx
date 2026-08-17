"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

interface FormProps {
  targetEditId?: string; 
}

export default function CourseApplicationForm({ targetEditId }: FormProps) {
  const [activeYear, setActiveYear] = useState("116學年度"); 
  const [formFields, setFormFields] = useState<any[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [fileMap, setFileMap] = useState<Record<string, File>>({}); // 暫存上傳的檔案物件
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const initForm = async () => {
      try {
        // 1. 抓取年度設定
        const { data: settings } = await supabase
          .from("system_settings")
          .select("year_name")
          .order("end_date", { ascending: false }) 
          .limit(1)
          .single();
        if (settings) setActiveYear(settings.year_name);

        // 2. 從 Supabase 抓取管理者設定好的表單欄位
        const { data: fields, error: fieldError } = await supabase
          .from("form_fields")
          .select("*")
          .eq("is_active", true)
          .order("order_index", { ascending: true });

        if (fieldError) throw fieldError;
        setFormFields(fields || []);

        // 3. 初始化預設值
        const initialValues: Record<string, any> = {
          day: "星期一",
          division: "日間部",
          time: "第1-2節（ＡＭ）",
          status: "",
          category: "",
          course_code: ""
        };

        if (targetEditId) {
          const { data: app, error: appError } = await supabase
            .from("applications")
            .select("*")
            .eq("id", targetEditId)
            .single();

          if (appError) throw appError;
          if (app) {
            setFormData({
              ...app,
              course_code: app.course_code === "無" ? "" : app.course_code
            });
          }
        } else {
          setFormData(initialValues);
        }
      } catch (err) {
        console.error("初始化表單失敗:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initForm();
  }, [targetEditId]);

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => {
      const nextData = { ...prev, [fieldName]: value };

      // 開設情形改變時，清空相依欄位
      if (fieldName === "status") {
        nextData.category = "";
        nextData.course_code = "";
      }

      // 星期或部別改變時，重置時間預設值
      if (fieldName === "day" || fieldName === "division") {
        nextData.time = "第1-2節（ＡＭ）";
      }

      return nextData;
    });
  };

  const handleFileChange = (fieldName: string, file: File | undefined) => {
    if (file) {
      setFileMap((prev) => ({ ...prev, [fieldName]: file }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.status === "曾開設課程") {
      const code = formData.course_code || "";
      if (!code.toUpperCase().startsWith("DGGC")) {
        alert("⚠️ 格式錯誤：科目代碼必須以「DGGC」開頭的流水號！");
        return; 
      }
    }

    setIsSubmitting(true);

    try {
      let updatedFormData = { ...formData };

      // 📍 批次上傳檔案到 Supabase Storage
      for (const [fieldName, file] of Object.entries(fileMap)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `applications/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("uploads")
          .getPublicUrl(filePath);

        updatedFormData[fieldName] = publicUrlData.publicUrl;
      }

      const inputTeacher = (updatedFormData.teacher || "").trim();
      const inputSemester = updatedFormData.semester || "";
      const inputTime = `${updatedFormData.day || "星期一"} ${updatedFormData.time || "第1-2節（ＡＭ）"}`; 

      if (!targetEditId) {
        const { data: existingData } = await supabase
          .from("applications")
          .select("id")
          .eq("teacher", inputTeacher)
          .eq("semester", inputSemester)
          .eq("time", inputTime)
          .limit(1); 

        if (existingData && existingData.length > 0) {
          alert(`⚠️ 您在 ${inputSemester} 的 ${inputTime} 已有申請紀錄，請勿重複填寫。`);
          setIsSubmitting(false);
          return; 
        }
      }

      const applicationData: Record<string, any> = {
        ...updatedFormData,
        teacher: inputTeacher,
        time: inputTime,
        course_code: updatedFormData.status === "曾開設課程" ? (updatedFormData.course_code || "").toUpperCase() : "無",
        submit_date: new Date().toLocaleString('zh-TW', { hour12: false }),
        status: "審核中"
      };

      let error;
      let currentAppId = targetEditId;

      if (targetEditId) {
        const result = await supabase.from("applications").update(applicationData).eq("id", targetEditId);
        error = result.error;
      } else {
        const { data, error: insertError } = await supabase.from("applications").insert([applicationData]).select();
        error = insertError;
        if (data && data.length > 0) {
          currentAppId = data[0].id.toString();
        }
      }
      
      if (error) throw error;

      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: applicationData.email,
          teacher: applicationData.teacher,
          course: applicationData.course_zh, // 寄信用中文課程名稱
          year: applicationData.semester,
          id: currentAppId 
        }),
      }).catch(err => console.error("信件發送失敗:", err));
      
      if (targetEditId) {
        alert("✅ 資料已成功修正！即將返回查詢頁面。");
        window.location.href = "/query"; 
      } else {
        alert("✅ 申請資料已成功送出！確認信已寄至您的信箱。");
      }

    } catch (err) {
      console.error(err);
      alert("❌ 存檔或上傳失敗，請聯絡系統管理員！");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-blue-500 animate-pulse font-bold">⏳ 正在載入完整動態表單...</div>;
  }

  return (
    <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
      {formFields.map((field) => {
        const value = formData[field.field_name] ?? "";

        // 條件顯示判斷
        if (field.conditional_field) {
          const parentValue = formData[field.conditional_field];
          if (parentValue !== field.conditional_value) {
            return null; 
          }
        }

        return (
          <div key={field.id} className="form-group">
            <div className="flex justify-between items-center">
              <label className={`label ${field.required ? "required" : ""}`}>
                {field.label}
              </label>
              {/* 如果後台有設定該題目的空白格式下載連結，則顯示下載按鈕 */}
              {field.template_url && (
                <a
                  href={field.template_url}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-1 rounded hover:bg-blue-100 transition"
                >
                  📥 下載空白格式
                </a>
              )}
            </div>

            {/* 1. 文字輸入框 (含中英文課程名稱、教師姓名、手機、代碼等) */}
            {field.field_type === "text" && (
              <input
                type="text"
                name={field.field_name}
                required={field.required}
                placeholder={field.placeholder || "請詳答"}
                value={value}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                disabled={field.field_name === "course_code" && formData.status === "新開設課程"}
                className={field.field_name === "course_code" && formData.status === "新開設課程" ? "bg-gray-100" : ""}
              />
            )}

            {/* 2. 電子信箱 */}
            {field.field_type === "email" && (
              <input
                type="email"
                name={field.field_name}
                required={field.required}
                placeholder={field.placeholder || "請詳答"}
                value={value}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
              />
            )}

            {/* 3. 下拉選單 (支援動態學期、課程類別、星期、上課時間等) */}
            {field.field_type === "select" && (
              <select
                name={field.field_name}
                required={field.required}
                value={value}
                onChange={(e) => handleChange(field.field_name, e.target.value)}
                disabled={field.field_name === "category" && formData.status === ""}
              >
                <option value="" disabled>
                  {field.field_name === "category" && formData.status === "" ? "請先選擇上方的「開設情形」" : "請選擇"}
                </option>

                {field.options?.map((opt: string, idx: number) => {
                  let dynamicOpt = opt;
                  if (field.field_name === "semester") {
                    dynamicOpt = opt.replace("${activeYear}", activeYear);
                  }

                  const isCoreDisabled = field.field_name === "category" && formData.status === "新開設課程" && dynamicOpt.includes("博雅核心");

                  return (
                    <option key={idx} value={dynamicOpt} disabled={isCoreDisabled}>
                      {dynamicOpt}
                    </option>
                  );
                })}

                {field.field_name === "time" && (
                  <>
                    <option value="第1-2節（ＡＭ）">第1-2節（ＡＭ）</option>
                    <option value="第3-4節（ＡＭ）">第3-4節（ＡＭ）</option>
                    {formData.day !== "星期三" && <option value="第5-6節（PＭ）">第5-6節（PＭ）</option>}
                    <option value="第7-8節（PＭ）">第7-8節（PＭ）</option>
                    <option value="第8-9節（PM）">第8-9節（PＭ）</option>
                    {formData.division === "進修部" && (
                      <>
                        <option value="第10-11節（PＭ）">第10-11節（PＭ）</option>
                        <option value="第12-13節（PＭ）">第12-13節（PＭ）</option>
                      </>
                    )}
                  </>
                )}
              </select>
            )}

            {/* 4. 單選按鈕 */}
            {field.field_type === "radio" && (
              <div className="radio-group" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {field.options?.map((opt: string, idx: number) => (
                  <label key={idx} className="radio-item">
                    <input
                      type="radio"
                      name={field.field_name}
                      value={opt}
                      required={field.required}
                      checked={value === opt}
                      onChange={(e) => handleChange(field.field_name, e.target.value)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            )}

            {/* 5. 檔案上傳 (支援 15 至 19 題) */}
            {field.field_type === "file" && (
              <div className="mt-1">
                <input
                  type="file"
                  required={field.required && !value}
                  onChange={(e) => handleFileChange(field.field_name, e.target.files?.[0])}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {value && typeof value === "string" && value.startsWith("http") && (
                  <p className="text-xs text-green-600 mt-1">
                    📎 已上傳檔案：<a href={value} target="_blank" rel="noopener noreferrer" className="underline">點擊檢視檔案</a>
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? "正在上傳並儲存..." : targetEditId ? "確認修改並覆蓋" : "確認傳送申請資料"}
      </button>
    </form>
  );
}