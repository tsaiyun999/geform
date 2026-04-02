"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

// 📍 1. 讓元件可以接收外部傳來的 ID
interface FormProps {
  targetEditId?: string; 
}

export default function CourseApplicationForm({ targetEditId }: FormProps) {
  const [activeYear, setActiveYear] = useState("116學年度"); 
  const [day, setDay] = useState("星期一");
  const [division, setDivision] = useState("日間部");
  const [time, setTime] = useState("第1-2節（ＡＭ）");
  const [courseStatus, setCourseStatus] = useState(""); 
  const [courseCategory, setCourseCategory] = useState(""); 
  const [courseCode, setCourseCode] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 📍 2. 準備一個 state 來存放撈出來的舊資料
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    const initForm = async () => {
      // 抓取年度設定
      const { data: settings } = await supabase
        .from("system_settings")
        .select("year_name")
        .order("end_date", { ascending: false }) 
        .limit(1)
        .single();
      if (settings) setActiveYear(settings.year_name);

      // 📍 如果有傳入 Edit ID，就去資料庫撈這筆申請的完整資料
      if (targetEditId) {
        const { data: app } = await supabase.from("applications").select("*").eq("id", targetEditId).single();
        if (app) {
          setInitialData(app); // 存入狀態以供 Input 預設值使用
          // 同步更新受控組件的狀態
          setCourseStatus(app.type);
          setCourseCode(app.course_code === "無" ? "" : app.course_code);
          setCourseCategory(app.category);
          setDay(app.time.split(" ")[0]); 
          setTime(app.time.split(" ")[1]);
          setDivision(app.division);
        }
      }
    };
    initForm();
  }, [targetEditId]);

  // 📍 3. 如果是編輯模式，但資料還沒撈回來，先顯示載入中 (確保資料能正確綁定到畫面)
  if (targetEditId && !initialData) {
    return <div className="text-center py-10 text-blue-500 animate-pulse font-bold">⏳ 正在載入舊資料...</div>;
  }

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseStatus(e.target.value);
    setCourseCategory(""); 
    setCourseCode("");     
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (courseStatus === "曾開設課程") {
      if (!courseCode || !courseCode.toUpperCase().startsWith("DGGC")) {
        alert("⚠️ 格式錯誤：科目代碼必須以「DGGC」開頭的流水號！");
        return; 
      }
    }

    setIsSubmitting(true);
    const inputTeacher = (formData.get("teacher") as string).trim();
    const inputSemester = formData.get("semester") as string;
    const inputTime = `${day} ${time}`; 

    try {
      // 📍 若為「新申請」，才檢查是否重複；「修改」則不檢查，以免被自己擋住
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

      const applicationData = {
        teacher: inputTeacher,
        semester: inputSemester,
        course: formData.get("course") as string,
        course_code: courseStatus === "曾開設課程" ? courseCode.toUpperCase() : "無",
        category: formData.get("category") as string,
        type: courseStatus,
        campus: formData.get("campus") as string,
        division: division,
        time: inputTime,
        pc: formData.get("pc") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        submit_date: new Date().toISOString().split('T')[0],
        status: "審核中"
      };

      // 📍 4. 判斷是「更新(Update)」還是「新增(Insert)」，並取得最終 ID
      let error;
      let currentAppId = targetEditId; // 準備一個變數來存 ID 給 Email 用

      if (targetEditId) {
        // 更新模式
        const result = await supabase.from("applications").update(applicationData).eq("id", targetEditId);
        error = result.error;
      } else {
        // 新增模式：必須加上 .select() 才能請資料庫把剛建好的 ID 吐回來
        const { data, error: insertError } = await supabase.from("applications").insert([applicationData]).select();
        error = insertError;
        if (data && data.length > 0) {
          currentAppId = data[0].id.toString(); // 成功抓到新 ID！
        }
      }
      
      if (error) throw error;

      // 📍 5. 寄信通知 (把確定有值的 currentAppId 傳過去)
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: applicationData.email,
          teacher: applicationData.teacher,
          course: applicationData.course,
          year: applicationData.semester,
          id: currentAppId // 這裡就不會報錯了！
        }),
      }).catch(err => console.error("信件發送失敗:", err));
      
      // 📍 6. 成功後的導向
      if (targetEditId) {
        alert("✅ 資料已成功修正！即將返回查詢頁面。");
        window.location.href = "/query"; 
      } else {
        alert("✅ 申請資料已成功送出！確認信已寄至您的信箱。");
        form.reset(); 
        setCourseStatus("");
        setCourseCategory("");
        setCourseCode("");
        setDay("星期一");
        setDivision("日間部");
        setTime("第1-2節（ＡＭ）");
      }

    } catch (err) {
      console.error(err);
      alert("❌ 存檔失敗，請聯絡系統管理員！");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="label required">1. 授課教師姓名</label>
        {/* 📍 使用 defaultValue 綁定舊資料 */}
        <input type="text" name="teacher" required placeholder="請詳答" defaultValue={initialData?.teacher} />
      </div>

      <div className="form-group">
        <label className="label required">2. 開設學期 (每學期每門課填一份)</label>
        <select name="semester" required defaultValue={initialData?.semester || ""}>
          <option value="" disabled>請選擇學期</option>
          <option value={`${activeYear}第1學期`}>{activeYear}第1學期</option>
          <option value={`${activeYear}第2學期`}>{activeYear}第2學期</option>
        </select>
      </div>

      <div className="form-group">
        <label className="label required">3. 課程名稱 (曾開設請填寫正確完整名稱)</label>
        <input type="text" name="course" required placeholder="請詳答" defaultValue={initialData?.course} />
      </div>
      
      <div className="form-group">
        <label className="label required">4. 開設情形</label>
        <div className="radio-group">
          <label className="radio-item"><input type="radio" name="status" value="新開設課程" required onChange={handleStatusChange} checked={courseStatus === "新開設課程"} /> 新開設課程</label>
          <label className="radio-item"><input type="radio" name="status" value="曾開設課程" required onChange={handleStatusChange} checked={courseStatus === "曾開設課程"} /> 曾開設課程</label>
        </div>
      </div>

      <div className="form-group">
        <label className="label required">5. 課程類別 (新開設限勾選博雅選修)</label>
        <select required name="category" value={courseCategory} onChange={(e) => setCourseCategory(e.target.value)} disabled={courseStatus === ""} >
          <option value="" disabled>請先選擇上方的「開設情形」</option>
          <option value="博雅核心-自然科學與應用科技" disabled={courseStatus === "新開設課程"}>博雅核心-自然科學與應用科技</option>
          <option value="博雅核心-社會經濟與資訊媒體" disabled={courseStatus === "新開設課程"}>博雅核心-社會經濟與資訊媒體</option>
          <option value="博雅核心-人文藝術與哲學倫理" disabled={courseStatus === "新開設課程"}>博雅核心-人文藝術與哲學倫理</option>
          <option value="博雅選修-自然">博雅選修-自然</option>
          <option value="博雅選修-社會">博雅選修-社會</option>
          <option value="博雅選修-人文">博雅選修-人文</option>
        </select>
      </div>
      
      <div className="form-group">
        <label className={`label ${courseStatus === "曾開設課程" ? "required text-blue-600 font-bold" : "text-gray-400"}`}>
          6. 科目代碼 (曾開設課程必填)
        </label>
        <input 
          type="text" name="code" 
          placeholder={courseStatus === "曾開設課程" ? "請填寫 DGGC 開頭的流水號" : "新課程無需填寫"} 
          value={courseCode} 
          onChange={(e) => setCourseCode(e.target.value)} 
          required={courseStatus === "曾開設課程"} 
          disabled={courseStatus === "新開設課程"}
          className={courseStatus === "新開設課程" ? "bg-gray-100" : ""}
        />
      </div>
      
      <div className="form-group">
        <label className="label required">7. 上課星期 (星期三 5、6 節不得排課)</label>
        <select required value={day} onChange={(e) => { setDay(e.target.value); setTime("第1-2節（ＡＭ）"); }}>
          <option value="星期一">星期一</option><option value="星期二">星期二</option><option value="星期三">星期三</option><option value="星期四">星期四</option><option value="星期五">星期五</option><option value="星期六">星期六</option>
        </select>
      </div>

      <div className="form-group">
        <label className="label required">8. 開設部別</label>
        <div className="radio-group">
          <label className="radio-item"><input type="radio" name="div" value="日間部" required checked={division === "日間部"} onChange={(e) => { setDivision(e.target.value); setTime("第1-2節（ＡＭ）"); }} /> 日間部</label>
          <label className="radio-item"><input type="radio" name="div" value="進修部" required checked={division === "進修部"} onChange={(e) => { setDivision(e.target.value); setTime("第1-2節（ＡＭ）"); }} /> 進修部</label>
        </div>
      </div>
      
      <div className="form-group">
        <label className="label required">9. 上課時間 (日間部不得晚於下午6時)</label>
        <select required name="time" value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="第1-2節（ＡＭ）">第1-2節（ＡＭ）</option>
          <option value="第3-4節（ＡＭ）">第3-4節（ＡＭ）</option>
          {day !== "星期三" && <option value="第5-6節（PＭ）">第5-6節（PＭ）</option>}
          <option value="第7-8節（PＭ）">第7-8節（PＭ）</option>
          <option value="第8-9節（PＭ）">第8-9節（PＭ）</option>
          {division === "進修部" && (
            <>
              <option value="第10-11節（PＭ）">第10-11節（PＭ）</option>
              <option value="第12-13節（PＭ）">第12-13節（PＭ）</option>
            </>
          )}
        </select>
      </div>

      <div className="form-group">
        <label className="label required">10. 上課校區</label>
        <div className="radio-group">
          {/* 📍 使用 defaultChecked 來還原選擇 */}
          <label className="radio-item"><input type="radio" name="campus" value="二坪校區" required defaultChecked={initialData?.campus === "二坪校區"} /> 二坪校區</label>
          <label className="radio-item"><input type="radio" name="campus" value="八甲校區" required defaultChecked={initialData?.campus === "八甲校區"} /> 八甲校區</label>
        </div>
      </div>

      <div className="form-group">
        <label className="label required">11. 是否於電腦教室授課 (學生每人1台電腦)</label>
        <div className="radio-group">
          <label className="radio-item"><input type="radio" name="pc" value="是" required defaultChecked={initialData?.pc === "是"} /> 是</label>
          <label className="radio-item"><input type="radio" name="pc" value="否" required defaultChecked={initialData?.pc === "否"} /> 否</label>
        </div>
      </div>

      <div className="form-group">
        <label className="label required">12. 授課教師手機號碼</label>
        <input type="text" name="phone" required placeholder="請詳答" defaultValue={initialData?.phone} />
      </div>

      <div className="form-group">
        <label className="label required">13. 電子信箱 (E-MAIL)</label>
        <input type="email" name="email" required placeholder="請詳答" defaultValue={initialData?.email} />
      </div>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? "正在儲存資料..." : targetEditId ? "確認修改並覆蓋" : "確認傳送申請資料"}
      </button>
    </form>
  );
}