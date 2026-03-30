"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginBox() {
  const router = useRouter();

  // 這些狀態現在只專屬於這個登入積木，不會干擾首頁表單
  const [clickCount, setClickCount] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [password, setPassword] = useState("");

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
    <div className="admin-section">
      <span className="admin-trigger-text" onClick={handleAdminTrigger}>
        © 國立聯合大學通識教育中心
      </span>

      {showAdmin && (
        <div className="admin-panel">
          <h4 style={{ margin: "0 0 10px 0" }}>助理專用登入</h4>
          <input 
            type="password" 
            style={{ padding: "10px", borderRadius: "5px", border: "1px solid #CCC", marginRight: "10px" }} 
            placeholder="輸入管理密碼 (預設:admin123)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={verifyAdmin} 
            style={{ padding: "10px 20px", cursor: "pointer", background: "var(--nuu-blue)", color: "white", border: "none", borderRadius: "5px" }}
          >
            登入後台
          </button>
        </div>
      )}
    </div>
  );
}