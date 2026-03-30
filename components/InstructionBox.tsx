import React from "react";

export default function InstructionBox() {
  return (
    <div className="instruction-box">
      <h3>【填表說明】</h3>
      <ol>
        <li>每學期每一門課程請填寫一份申請，一門課程同一學期開設兩個班需填寫兩份申請。</li>
        <li><strong>新課程要求：</strong>請將課程綱要寄至 hsinhua@nuu.edu.tw，格式請參閱附加檔案。</li>
        <li><strong>新聘兼任教師：</strong>請寄送履歷表、提聘表、最高學歷影本及課綱至中心。</li>
        <li>建議上下學期盡可能開設不同課程，並自行評估學生選課需求。</li>
        <li><strong>本校專任教師：</strong>日間部每學期以 2 門(4小時)為限。</li>
        <li><strong>申請截止日期：</strong>請於 <strong>116年2月28日</strong> 前完成申請，逾時恕難辦理。</li>
      </ol>
    </div>
  );
}