import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. 接收表單傳來的資訊
    const { email, teacher, course, year, id } = await request.json();

    // 2. 建立 Gmail 發信通道 (讀取環境變數)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // 你的 Gmail 帳號
        pass: process.env.GMAIL_PASS, // 你的 16 碼應用程式密碼
      },
      tls: {
    rejectUnauthorized: false
    }
    });

    // 3. 設定信件內容
    const mailOptions = {
      from: `"聯大通識中心" <${process.env.GMAIL_USER}>`, // 寄件人顯示名稱
      to: email,                                         // 收件人
      subject: `【申請成功】${course} 開課申請收執聯`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #2c3e50;">${teacher} 老師您好：</h2>
          <p>系統已收到您在 <strong>${year}</strong> 的開課申請，資料已存入雲端資料庫。</p>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <ul style="list-style: none; padding-left: 0;">
            <li><strong>📚 課程名稱：</strong> ${course}</li>
            <li><strong>⏳ 申請狀態：</strong> 審核中</li>
          </ul>
          <p style="margin-top: 20px;">若發現資料有誤或需調整時間，請點擊下方專屬連結，並通過手機驗證進行修正：</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/edit/${id}" 
               style="background: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
               前往解鎖並修正資料
            </a>
          </div>
          
          <p style="font-size: 12px; color: #888; border-top: 1px solid #eee; padding-top: 15px;">
            ※ 此為系統自動發送郵件，請勿直接回覆。如有問題請洽通識教育中心管理員。
          </p>
        </div>
      `,
    };

    // 4. 執行發信
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "信件已寄出" });

  } catch (error: any) {
    console.error('Nodemailer 發信發生錯誤:', error);
    return NextResponse.json(
      { error: '發信失敗', details: error.message }, 
      { status: 500 }
    );
  }
}