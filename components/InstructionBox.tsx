import React from "react";

export default function InstructionBox() {
  return (
    <div className="instruction-box">
      <h3>【填表說明 </h3>
      <ol>
        <li>每學期每一門課程請填寫一份申請，一門課程同一學期開設兩個班需填寫兩份申請。</li>
        <li><strong>新課程要求：</strong>若有新開設的課程，請於申請期限內寄送本校統一格式課程綱要至 hsinhua@nuu.edu.tw，新課程依規定須通過中心、共教會二級審查始得開課，格式請參閱附加檔案。</li>
        <li><strong>新聘兼任教師需求：</strong>初次申請開課之兼任教師，請於申請期限內寄送國立聯合大學教師履歷表、教師提聘表、最高學歷證書影本、課程綱要至 hsinhua@nuu.edu.tw，新聘教師需經本校三級教評會審查通過始得聘任，相關格式請參閱附加檔案。</li>
        <li>上下學期開設同課程或同學期同課程開設兩班建議自行評估學生選課需求，建議上下學期盡可能開設不同課程。</li>
        <li><strong>本校專任教師：</strong>每學期以開設 2 門(4小時)日間部通識課程為限，同課程開設 2 班需分別開設於兩校區；但進修部通識課程之開設不受此限。</li>
        <li><strong>申請截止日期：</strong>請於 <strong>116年2月28日</strong> 前完成所有的課程開設申請，逾時恕難辦理。</li>
      </ol>
    </div>
  );
}