"use client";

import React from "react";

// 📍 定義 Props 介面
interface InstructionBoxProps {
  deadline: string; // 接收來自 page.tsx 的動態日期
}

export default function InstructionBox({ deadline }: InstructionBoxProps) {
  return (
    <div className="instruction-box bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 text-gray-700">
      <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-blue-100 flex items-center gap-2">
        <span>📋</span> 【 填表說明 】
      </h3>
      
      <ol className="list-decimal ml-5 space-y-4 text-sm leading-relaxed">
        <li>
          每學期每一門課程請填寫一份申請，一門課程同一學期開設兩個班需填寫兩份申請。
        </li>
        
        <li>
          <strong className="text-blue-700">新課程要求：</strong>
          若有新開設的課程，請於申請期限內寄送本校統一格式課程綱要至 
          <a href="mailto:hsinhua@nuu.edu.tw" className="text-blue-500 underline mx-1">hsinhua@nuu.edu.tw</a>，
          新課程依規定須通過中心、共教會二級審查始得開課，格式請參閱附加檔案。
        </li>
        
        <li>
          <strong className="text-blue-700">新聘兼任教師需求：</strong>
          初次申請開課之兼任教師，請於申請期限內寄送國立聯合大學教師履歷表、教師提聘表、最高學歷證書影本、課程綱要至 
          <a href="mailto:hsinhua@nuu.edu.tw" className="text-blue-500 underline mx-1">hsinhua@nuu.edu.tw</a>，
          新聘教師需經本校三級教評會審查通過始得聘任，相關格式請參閱附加檔案。
        </li>
        
        <li>
          上下學期開設同課程或同學期同課程開設兩班建議自行評估學生選課需求，建議上下學期盡可能開設不同課程。
        </li>
        
        <li>
          <strong className="text-blue-700">本校專任教師：</strong>
          每學期以開設 2 門 (4小時) 日間部通識課程為限，同課程開設 2 班需分別開設於兩校區；但進修部通識課程之開設不受此限。
        </li>
        
        <li className="bg-red-50 p-2 rounded-lg border border-red-100">
          <strong className="text-red-600 underline">申請截止日期：</strong>
          請於 <strong className="text-red-700 text-lg mx-1">{deadline || "設定日期"}</strong> 
          前完成所有的課程開設申請，逾時恕難辦理。
        </li>
      </ol>
    </div>
  );
}