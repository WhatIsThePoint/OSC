import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
});

export async function sendMail(to: string | string[], subject: string, text: string) {
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}
