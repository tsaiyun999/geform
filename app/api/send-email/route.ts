// app/api/send-email/route.ts
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

// 📍 請去 Resend 官網申請 API KEY 並放入 .env.local
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 📍 1. 確保有接收到 id
    const { email, teacher, course, year, id } = await request.json();

    const data = await resend.emails.send({
      from: '聯大通識中心 <onboarding@resend.dev>',
      to: [email],
      subject: `【申請成功】${course} 開課申請收執聯`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333;">
          <h2>${teacher} 老師您好：</h2>
          <p>您已成功送出 <strong>${year}</strong> 的開課申請。</p>
          <hr />
          <ul>
            <li><strong>課程名稱：</strong> ${course}</li>
            <li><strong>申請狀態：</strong> 審核中</li>
          </ul>
          <p>若發現資料有誤，請點擊下方專屬連結，並通過手機驗證進行修正：</p>
          
          <a href="${process.env.NEXT_PUBLIC_BASE_URL}/edit/${id}" 
             style="background: #3498db; color: white; padding: 10px 20px; text-decoration: none; rounded: 5px; display: inline-block; margin-top: 10px;">
             前往解鎖並修正資料
          </a>
          
          <p style="font-size: 12px; color: #888; margin-top: 20px;">※ 此為系統自動發送，請勿直接回覆。</p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}