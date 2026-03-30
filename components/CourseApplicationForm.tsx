"use client";

import React, { useState } from "react";
import { supabase } from "@/utils/supabase"; 

export default function CourseApplicationForm() {
  const [day, setDay] = useState("星期一");
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
    
    // 🌟 解法在這裡：在去雲端之前，先把表單「綁架」起來存進變數！
    const form = e.currentTarget;

    if (courseStatus === "曾開設課程") {
      if (!courseCode || !courseCode.toUpperCase().startsWith("DGGC")) {
        alert("⚠️ 格式錯誤：曾經開設之課程，科目代碼必須以「DGGC」開頭！");
        return; 
      }
    }

    setIsSubmitting(true); 

    const formData = new FormData(form);
    const inputTeacher = formData.get("teacher") as string;
    const inputSemester = formData.get("semester") as string;
    const inputCourse = formData.get("course") as string;
    const inputCategory = formData.get("category") as string;
    const inputTime = `${day} ${formData.get("time")}`; 
    
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
      alert(`⚠️ 錯誤：${inputTeacher} 老師，您已經在 ${inputSemester} 學期「${inputTime}」送出過「${inputCourse}」的申請了，請勿重複填寫！`);
      setIsSubmitting(false);
      return; 
    }

    const newApplication = {
      teacher: inputTeacher,
      semester: inputSemester,
      course: inputCourse,
      course_code: courseStatus === "曾開設課程" ? courseCode.toUpperCase() : "無",
      category: inputCategory, 
      type: courseStatus,
      campus: formData.get("campus") as string,
      time: inputTime, 
      pc: formData.get("pc") as string,       
      phone: formData.get("phone") as string, 
      email: formData.get("email") as string, 
      submit_date: new Date().toISOString().split('T')[0],
      status: "審核中" 
    };

    const { error: insertError } = await supabase
      .from("applications")
      .insert([newApplication]);

    if (insertError) {
      console.error(insertError);
      alert("❌ 存檔失敗，請聯絡系統管理員！");
    } else {
      alert("✅ 申請資料已成功送出並存入雲端！");
      // 🌟 這裡使用剛剛記下來的 form 來清空表單！
      form.reset(); 
      setCourseStatus("");
      setCourseCategory("");
      setCourseCode("");
      setDay("星期一");
    }
    
    setIsSubmitting(false); 
  };

  return (
    <form id="courseForm" onSubmit={handleSubmit}>
      <div className="form-group"><label className="label required">1. 授課教師姓名</label><input type="text" name="teacher" required /></div>
      <div className="form-group"><label className="label required">2. 開設學期</label><select name="semester" required defaultValue=""><option value="" disabled>請選擇學期</option><option value="116-1">116-1</option><option value="116-2">116-2</option></select></div>
      <div className="form-group"><label className="label required">3. 課程名稱</label><input type="text" name="course" required /></div>
      
      <div className="form-group">
        <label className="label required">4. 開設情形</label>
        <div className="radio-group">
          <label className="radio-item"><input type="radio" name="status" value="新開設課程" required onChange={handleStatusChange} checked={courseStatus === "新開設課程"} /> 新開設課程</label>
          <label className="radio-item"><input type="radio" name="status" value="曾開設課程" required onChange={handleStatusChange} checked={courseStatus === "曾開設課程"} /> 曾開設課程</label>
        </div>
      </div>

      <div className="form-group">
        <label className="label required">5. 課程類別</label>
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
      
      <div className="form-group"><label className={`label ${courseStatus === "曾開設課程" ? "required" : ""}`}>6. 科目代碼</label><input type="text" name="code" placeholder="例如: DGGC1234" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required={courseStatus === "曾開設課程"} disabled={courseStatus === "新開設課程"} /></div>
      <div className="form-group"><label className="label required">7. 上課星期</label><select required value={day} onChange={(e) => setDay(e.target.value)}><option value="星期一">星期一</option><option value="星期二">星期二</option><option value="星期三">星期三</option><option value="星期四">星期四</option><option value="星期五">星期五</option></select></div>
      <div className="form-group"><label className="label required">8. 上課時間 (節次)</label><select required name="time" defaultValue="1-2 節"><option value="1-2 節">1-2 節</option><option value="3-4 節">3-4 節</option>{day !== "星期三" && <option value="5-6 節">5-6 節</option>}<option value="7-8 節">7-8 節</option><option value="10-11 節">10-11 節</option></select></div>
      <div className="form-group"><label className="label required">9. 上課校區</label><div className="radio-group"><label className="radio-item"><input type="radio" name="campus" value="二坪" required /> 二坪校區</label><label className="radio-item"><input type="radio" name="campus" value="八甲" required /> 八甲校區</label></div></div>
      <div className="form-group"><label className="label required">10. 開設部別</label><div className="radio-group"><label className="radio-item"><input type="radio" name="div" value="日" required /> 日間部</label><label className="radio-item"><input type="radio" name="div" value="進" required /> 進修部</label></div></div>
      <div className="form-group"><label className="label required">11. 是否於電腦教室授課</label><div className="radio-group"><label className="radio-item"><input type="radio" name="pc" value="是" required /> 是</label><label className="radio-item"><input type="radio" name="pc" value="否" required /> 否</label></div></div>
      <div className="form-group"><label className="label required">12. 授課教師手機號碼</label><input type="text" name="phone" required placeholder="09xxxxxxxx" /></div>
      <div className="form-group"><label className="label required">13. 電子信箱 (E-MAIL)</label><input type="email" name="email" required /></div>

      <button type="submit" className="btn-submit" disabled={isSubmitting}>
        {isSubmitting ? "資料傳送中..." : "確認傳送申請資料"}
      </button>
    </form>
  );
}