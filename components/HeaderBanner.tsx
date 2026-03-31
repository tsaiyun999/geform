"use client";

import React from "react";

// 📍 定義它可以接收一個叫 year 的參數
interface HeaderBannerProps {
  year?: string; 
}

export default function HeaderBanner({ year }: HeaderBannerProps) {
  return (
    <div className="header-banner">
      <div className="banner-mask">
        {/* 📍 這裡改用傳進來的 year，如果沒傳就顯示載入中或預設值 */}
        <h1>國立聯合大學 {year || "通識課程"} 開課申請</h1>
      </div>
    </div>
  );
}