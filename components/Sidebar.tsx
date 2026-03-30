"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm("確定要登出系統嗎？")) {
      router.push("/");
    }
  };

  return (
    <aside className="w-64 flex-col bg-[#0B0D10] text-white flex shadow-2xl border-r border-gray-800">
      <div className="border-b border-gray-800 p-6 text-xl font-bold tracking-wider text-center text-[#5DADE2]">
        通識中心後台
      </div>
      <nav className="flex-1 space-y-2 p-4">
        <Link href="/dashboard" className="block rounded-md bg-[#1A1D21] px-4 py-3 font-medium text-white shadow-md border border-gray-700">
          📋 開課申請管理
        </Link>
      </nav>
      <div className="p-4 border-t border-gray-800 bg-[#08090B]">
        <button 
          onClick={handleLogout} 
          className="block w-full rounded-md border border-gray-700 px-4 py-2 text-center text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-white"
        >
          登出系統
        </button>
      </div>
    </aside>
  );
}