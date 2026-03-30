"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase";

export default function CourseApplicationForm() {
  const [day, setDay] = useState("星期一");
  const [division, setDivision] = useState("日間部");
  const [time, setTime] = useState("第1-2節（ＡＭ）");
  const [courseStatus, setCourseStatus] = useState(""); 
  const [courseCategory, setCourseCategory] = useState(""); 
  const [courseCode, setCourseCode] = useState(""); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseStatus(e.target.value);
    setCourseCategory(""); 
    setCourseCode("");     
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    const form = e.currentTarget;

    // 檢核機制：DGGC 判斷
    if (courseStatus === "曾開設課程") {
      if (!courseCode || !courseCode.toUpperCase().startsWith("DGGC")) {
        alert("⚠️ 格式錯誤：曾經開設之課程，科目代碼必須以「DGGC」開頭的流水號！");
        return; 
      }
    }

    setIsSubmitting(true); 

    const formData = new FormData(form);
    const inputTeacher = formData.get("teacher") as string;
    const inputSemester = formData.get("semester") as string;
    const inputCourse = formData.get("course") as string;
    const inputCategory = formData.get("category") as string;
    const inputTime = `${day} ${time}`; // 星期與節次合併
    
    // 檢核機制：同一教師、學期、課程名稱、星期與時間，視為重複申請
    const { data: existingData, error: fetchError } = await supabase
      .from("applications")
      .select("*")
      .eq("teacher", inputTeacher)
      .eq("semester", inputSemester)
      .eq("course", inputCourse)
      .eq("time", inputTime);

    if (fetchError) {
      alert("❌ 檢查資料時發生錯誤，請稍後再試！");
      setIsSubmitting(false);
      return;
    }

    if (existingData && existingData.length > 0) {
      alert(`⚠️ 提醒您，此課程已完成申請！\n（${inputTeacher} 老師，您在 ${inputSemester} 已送出過「${inputCourse}」於 ${inputTime} 的資料）`);
      setIsSubmitting(false);
      return; 
    }

    // 準備存入資料 (將部別與校區合併存入 campus 欄位)
    const newApplication = {
      teacher: inputTeacher,
      semester: inputSemester,
      course: inputCourse,
      course_code: courseStatus === "曾開設課程" ? courseCode.toUpperCase() : "無",
      category: inputCategory, 
      type: courseStatus,
      campus: formData.get("campus") as string,  // 📍 恢復只存校區
      division: division, 
      time: inputTime, 
      pc: formData.get("pc") as string,       
      phone: formData.get("phone") as string, 
      email: formData.get("email") as string, 
      submit_date: new Date().toISOString().split('T')[0],
      status: "審核中" 
    };

    const { error: insertError } = await supabase.from("applications").insert([newApplication]);

    if (insertError) {
      alert("❌ 存檔失敗，請聯絡系統管理員！");
    } else {
      alert("✅ 申請資料已成功送出並存入雲端！");
      form.reset(); 
      setCourseStatus("");
      setCourseCategory("");
      setCourseCode("");
      setDay("星期一");
      setDivision("日間部");
      setTime("第1-2節（ＡＭ）");
    }
    
    setIsSubmitting(false); 
  };

  return (
    <form id="courseForm" onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group"><label className="label required">1. 授課教師姓名</label><input type="text" name="teacher" required placeholder="請詳答" /></div>
      <div className="form-group"><label className="label required">2. 開設學期 (每學期每門課填一份)</label><select name="semester" required defaultValue=""><option value="" disabled>請選擇學期</option><option value="116學年度第1學期">116學年度第1學期</option><option value="116學年度第2學期">116學年度第2學期</option></select></div>
      <div className="form-group"><label className="label required">3. 課程名稱 (曾開設請填寫正確完整名稱)</label><input type="text" name="course" required placeholder="請詳答" /></div>
      
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
      
      <div className="form-group"><label className={`label ${courseStatus === "曾開設課程" ? "required" : ""}`}>6. 科目代碼 (曾開設課程必填)</label><input type="text" name="code" placeholder="請填寫 DGGC 開頭的流水號" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required={courseStatus === "曾開設課程"} disabled={courseStatus === "新開設課程"} /></div>
      
      <div className="form-group">
        <label className="label required">7. 上課星期 (星期三 5、6 節不得排課)</label>
        <select required value={day} onChange={(e) => { setDay(e.target.value); setTime("第1-2節（ＡＭ）"); }}>
          <option value="星期一">星期一</option><option value="星期二">星期二</option><option value="星期三">星期三</option><option value="星期四">星期四</option><option value="星期五">星期五</option><option value="星期六">星期六</option>
        </select>
      </div>

      <div className="form-group"><label className="label required">8. 開設部別</label><div className="radio-group"><label className="radio-item"><input type="radio" name="div" value="日間部" required checked={division === "日間部"} onChange={(e) => { setDivision(e.target.value); setTime("第1-2節（ＡＭ）"); }} /> 日間部</label><label className="radio-item"><input type="radio" name="div" value="進修部" required checked={division === "進修部"} onChange={(e) => { setDivision(e.target.value); setTime("第1-2節（ＡＭ）"); }} /> 進修部</label></div></div>
      
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

      <div className="form-group"><label className="label required">10. 上課校區</label><div className="radio-group"><label className="radio-item"><input type="radio" name="campus" value="二坪校區" required /> 二坪校區</label><label className="radio-item"><input type="radio" name="campus" value="八甲校區" required /> 八甲校區</label></div></div>
      <div className="form-group"><label className="label required">11. 是否於電腦教室授課 (學生每人1台電腦)</label><div className="radio-group"><label className="radio-item"><input type="radio" name="pc" value="是" required /> 是</label><label className="radio-item"><input type="radio" name="pc" value="否" required /> 否</label></div></div>
      <div className="form-group"><label className="label required">12. 授課教師手機號碼</label><input type="text" name="phone" required placeholder="請詳答" /></div>
      <div className="form-group"><label className="label required">13. 電子信箱 (E-MAIL)</label><input type="email" name="email" required placeholder="請詳答" /></div>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? "資料傳送中..." : "確認傳送申請資料"}
      </button>
    </form>
  );
}