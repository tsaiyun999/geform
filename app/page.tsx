"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; 

export default function Home() {
  const router = useRouter(); 

  const [clickCount, setClickCount] = useState(0);       
  const [showAdmin, setShowAdmin] = useState(false);     
  const [password, setPassword] = useState("");          
  
  const [day, setDay] = useState("星期一");
  const [courseStatus, setCourseStatus] = useState(""); 
  const [courseCategory, setCourseCategory] = useState(""); 
  const [courseCode, setCourseCode] = useState(""); 

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCourseStatus(e.target.value);
    setCourseCategory(""); 
    setCourseCode("");     
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    
    if (courseStatus === "曾開設課程") {
      if (!courseCode || !courseCode.toUpperCase().startsWith("DGGC")) {
        alert("⚠️ 格式錯誤：曾經開設之課程，科目代碼必須以「DGGC」開頭！");
        return; 
      }
    }

    const formData = new FormData(e.currentTarget);
    const inputTeacher = formData.get("teacher") as string;
    const inputSemester = formData.get("semester") as string;
    const inputCourse = formData.get("course") as string;
    const inputCategory = formData.get("category") as string;
    const inputTime = `${day} ${formData.get("time")}`; 
    
    const existingData = JSON.parse(localStorage.getItem("nuu_applications") || "[]");

    const isDuplicate = existingData.some(
      (app: any) => 
        app.teacher === inputTeacher && 
        app.semester === inputSemester && 
        app.course === inputCourse &&
        app.time === inputTime 
    );

    if (isDuplicate) {
      alert(`⚠️ 錯誤：${inputTeacher} 老師，您已經在 ${inputSemester} 學期「${inputTime}」送出過「${inputCourse}」的申請了，請勿重複填寫！`);
      return; 
    }

    // 👇 整理資料，加入 pc, phone, email 三個欄位！
    const newApplication = {
      id: Date.now(),
      teacher: inputTeacher,
      semester: inputSemester,
      course: inputCourse,
      courseCode: courseStatus === "曾開設課程" ? courseCode.toUpperCase() : "無",
      category: inputCategory, 
      type: courseStatus,
      campus: formData.get("campus"),
      time: inputTime, 
      pc: formData.get("pc"),       // 新增：電腦教室
      phone: formData.get("phone"), // 新增：手機號碼
      email: formData.get("email"), // 新增：電子信箱
      submitDate: new Date().toISOString().split('T')[0],
      status: "審核中" 
    };

    existingData.push(newApplication);
    localStorage.setItem("nuu_applications", JSON.stringify(existingData));

    alert("✅ 申請資料已成功送出！請至後台查看。");
    
    e.currentTarget.reset();
    setCourseStatus("");
    setCourseCategory("");
    setCourseCode("");
    setDay("星期一");
  };

  const handleAdminTrigger = () => {
    const newCount = clickCount + 1;
    if (newCount === 3) {
      setShowAdmin(true);
      setClickCount(0); 
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      }, 100);
    } else {
      setClickCount(newCount);
    }
  };

  const verifyAdmin = () => {
    if (password === "admin123") {
      alert("✅ 驗證成功！即將進入後台管理系統...");
      router.push("/dashboard"); 
    } else {
      alert("❌ 密碼錯誤，請重新輸入！");
      setPassword("");
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        :root { --nuu-blue: #5DADE2; --bg-light-blue: #F0F8FF; --card-blue: #FFFFFF; --instruction-blue: #EBF5FB; --text-dark: #2C3E50; }
        body { background-color: var(--bg-light-blue); font-family: "Times New Roman", "DFKai-SB", "標楷體", serif; margin: 0; padding: 0; color: var(--text-dark); line-height: 1.8; }
        .header-banner { width: 100%; height: 300px; background: #D6EAF8 url('/mobilead_291_5647666_38735.jpg') no-repeat center center; background-size: cover; position: relative; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
        .banner-mask { background: rgba(255, 255, 255, 0.92); padding: 30px 50px; border-radius: 8px; text-align: center; border-top: 6px solid var(--nuu-blue); box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 85%; }
        .banner-mask h1 { margin: 0; font-size: 32px; color: var(--nuu-blue); font-weight: bold; letter-spacing: 1px; }
        .banner-mask p { margin: 8px 0 0 0; font-size: 16px; color: #7F8C8D; font-family: "Times New Roman", serif; }
        .main-container { padding: 40px 20px 80px; }
        .form-card { max-width: 900px; margin: 0 auto; background: var(--card-blue); padding: 50px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
        .instruction-box { background-color: var(--instruction-blue); border: 1px solid #D6EAF8; padding: 25px; border-radius: 10px; margin-bottom: 40px; }
        .instruction-box h3 { color: var(--nuu-blue); margin-top: 0; border-bottom: 2px solid var(--nuu-blue); display: inline-block; padding-bottom: 5px; }
        .instruction-box li { margin-bottom: 12px; text-align: justify; font-size: 0.95em; }
        .form-group { margin-bottom: 25px; }
        .label { display: block; font-weight: bold; margin-bottom: 10px; font-size: 1.1em; }
        .label.required::after { content: " *"; color: #E74C3C; }
        input[type="text"], input[type="email"], select { width: 100%; padding: 12px; border: 1.5px solid #D6DBDF; border-radius: 8px; font-size: 16px; box-sizing: border-box; transition: 0.3s; }
        input:focus, select:focus { border-color: var(--nuu-blue); outline: none; box-shadow: 0 0 8px rgba(93, 173, 226, 0.2); }
        input:disabled, select:disabled { background-color: #F2F4F4; cursor: not-allowed; color: #999; }
        .radio-group { display: flex; gap: 20px; flex-wrap: wrap; padding-top: 5px; }
        .radio-item { display: flex; align-items: center; cursor: pointer; padding: 8px 15px; background: #F7F9F9; border-radius: 8px; border: 1px solid #EDF2F4; }
        .radio-item input { margin-right: 8px; width: 18px; height: 18px; accent-color: var(--nuu-blue); }
        .btn-submit { width: 100%; background: var(--nuu-blue); color: white; padding: 18px; border: none; border-radius: 50px; cursor: pointer; font-size: 1.4em; font-weight: bold; letter-spacing: 5px; transition: 0.3s; margin-top: 20px; box-shadow: 0 4px 15px rgba(93, 173, 226, 0.3); }
        .btn-submit:hover { background: #3498DB; transform: translateY(-2px); box-shadow: 0 6px 20px rgba(93, 173, 226, 0.4); }
        .admin-section { margin-top: 80px; text-align: center; border-top: 1px solid #D6EAF8; padding-top: 20px; }
        .admin-trigger-text { color: #BDC3C7; font-size: 11px; cursor: default; user-select: none; }
        .admin-panel { margin-top: 20px; background: #EBF5FB; padding: 30px; border-radius: 12px; border: 1px dashed var(--nuu-blue); }
      `}} />

      <div className="header-banner">
        <div className="banner-mask">
          <h1>國立聯合大學116學年度通識課程開課申請</h1>
        </div>
      </div>

      <div className="main-container">
        <div className="form-card">
          <form id="courseForm" onSubmit={handleSubmit}>
            <div className="form-group"><label className="label required">1. 授課教師姓名</label><input type="text" name="teacher" required /></div>
            
            <div className="form-group">
              <label className="label required">2. 開設學期</label>
              <select name="semester" required defaultValue="">
                <option value="" disabled>請選擇學期</option>
                <option value="116-1">116-1</option>
                <option value="116-2">116-2</option>
              </select>
            </div>
            
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
            
            <div className="form-group">
              <label className={`label ${courseStatus === "曾開設課程" ? "required" : ""}`}>6. 科目代碼</label>
              <input type="text" name="code" placeholder="例如: DGGC1234" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} required={courseStatus === "曾開設課程"} disabled={courseStatus === "新開設課程"} />
            </div>
            
            <div className="form-group">
              <label className="label required">7. 上課星期</label>
              <select required value={day} onChange={(e) => setDay(e.target.value)}>
                <option value="星期一">星期一</option><option value="星期二">星期二</option><option value="星期三">星期三</option><option value="星期四">星期四</option><option value="星期五">星期五</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="label required">8. 上課時間 (節次)</label>
              <select required name="time" defaultValue="1-2 節">
                <option value="1-2 節">1-2 節</option><option value="3-4 節">3-4 節</option>
                {day !== "星期三" && <option value="5-6 節">5-6 節</option>}
                <option value="7-8 節">7-8 節</option><option value="10-11 節">10-11 節</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="label required">9. 上課校區</label>
              <div className="radio-group">
                <label className="radio-item"><input type="radio" name="campus" value="二坪" required /> 二坪校區</label>
                <label className="radio-item"><input type="radio" name="campus" value="八甲" required /> 八甲校區</label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="label required">10. 開設部別</label>
              <div className="radio-group">
                <label className="radio-item"><input type="radio" name="div" value="日" required /> 日間部</label>
                <label className="radio-item"><input type="radio" name="div" value="進" required /> 進修部</label>
              </div>
            </div>
            
            <div className="form-group">
              <label className="label required">11. 是否於電腦教室授課</label>
              <div className="radio-group">
                <label className="radio-item"><input type="radio" name="pc" value="是" required /> 是</label>
                <label className="radio-item"><input type="radio" name="pc" value="否" required /> 否</label>
              </div>
            </div>
            
            <div className="form-group"><label className="label required">12. 授課教師手機號碼</label><input type="text" name="phone" required placeholder="09xxxxxxxx" /></div>
            <div className="form-group"><label className="label required">13. 電子信箱 (E-MAIL)</label><input type="email" name="email" required /></div>

            <button type="submit" className="btn-submit">確認傳送申請資料</button>
          </form>
        </div>

        <div className="admin-section">
          <span className="admin-trigger-text" onClick={handleAdminTrigger}>
            © 國立聯合大學通識教育中心
          </span>

          {showAdmin && (
            <div className="admin-panel">
              <h4 style={{ margin: "0 0 10px 0" }}>助理專用登入</h4>
              <input type="password" style={{ padding: "10px", borderRadius: "5px", border: "1px solid #CCC", marginRight: "10px" }} placeholder="輸入管理密碼 (預設:admin123)" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button onClick={verifyAdmin} style={{ padding: "10px 20px", cursor: "pointer", background: "var(--nuu-blue)", color: "white", border: "none", borderRadius: "5px" }}>登入後台</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}