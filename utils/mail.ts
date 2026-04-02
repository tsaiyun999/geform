// utils/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendConfirmationEmail = async (email: string, teacher: string, course: string, id: number) => {
  await resend.emails.send({
    from: '通識教育中心 <noreply@your-domain.com>',
    to: email,
    subject: `【申請成功】${course} 開課申請收執聯`,
    html: `
      <p>${teacher} 老師您好：</p>
      <p>您已成功送出 <strong>${course}</strong> 的開課申請。</p>
      <p>若需查看或修正資料，請至查詢系統輸入您的姓名：</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/edit/${id}"前往查詢與修正</a>
      <p>謝謝您的配合。</p>
    `,
  });
};