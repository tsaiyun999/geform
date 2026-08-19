"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase";

interface InstructionBoxProps {
  deadline: string; 
}

export default function InstructionBox({ deadline }: InstructionBoxProps) {
  const [instructions, setInstructions] = useState<any[]>([]);

  useEffect(() => {
    const fetchInstructions = async () => {
      const { data } = await supabase
        .from("instructions")
        .select("*")
        .order("item_order", { ascending: true });
      
      if (data) setInstructions(data);
    };
    fetchInstructions();
  }, []);

  return (
    <div className="instruction-box bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-8 text-gray-700">
      <h3 className="text-xl font-bold text-blue-900 mb-4 pb-2 border-b border-blue-100 flex items-center gap-2">
        <span>📋</span> 【 填表說明 】
      </h3>
      
      <ol className="list-decimal ml-5 space-y-4 text-sm leading-relaxed">
        {instructions.map((item) => {
          // 自動把文字中的 {deadline} 替換成動態日期
          let text = item.content.replace("{deadline}", deadline || "設定日期");

          return (
            <li 
              key={item.id} 
              className={item.item_order === 6 ? "bg-red-50 p-2 rounded-lg border border-red-100" : ""}
            >
              {item.item_order === 6 ? (
                <>
                  <strong className="text-red-600 underline">申請截止日期：</strong>
                  請於 <strong className="text-red-700 text-lg mx-1">{deadline || "設定日期"}</strong> 前完成所有的課程開設申請，逾時恕難辦理。
                </>
              ) : (
                text
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}