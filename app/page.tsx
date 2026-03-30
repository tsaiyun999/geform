"use client";

import React, { useState, useEffect } from "react";
import HeaderBanner from "@/components/HeaderBanner";
import AdminLoginBox from "@/components/AdminLoginBox";
import InstructionBox from "@/components/InstructionBox";
import ClosedNotice from "@/components/ClosedNotice";
import CourseApplicationForm from "@/components/CourseApplicationForm";

export default function Home() {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // 這裡我們暫時保留 LocalStorage 來控制「前端表單顯示開關」
    const status = localStorage.getItem("nuu_form_status");
    if (status === "closed") {
      setIsFormOpen(false);
    }
    setIsLoaded(true); 
  }, []);

  return (
    <>
      <HeaderBanner />
      <div className="main-container">
        <div className="form-card">
          {isLoaded && isFormOpen ? (
            <>
              <InstructionBox />  
              <CourseApplicationForm />
            </>
          ) : isLoaded ? (
            <ClosedNotice />
          ) : null}
        </div>
        <AdminLoginBox />
      </div>
    </>
  );
}