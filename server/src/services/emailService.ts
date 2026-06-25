// src/services/email.service.ts
//
// Nodemailer-based email service.
// All email sending goes through this single service.

import nodemailer, { type Transporter } from "nodemailer";


let transporter: Transporter;

const getTransporter = (): Transporter => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port:  587,
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
};


export const verifyEmailConnection = async (): Promise<void> => {
  try {
    await getTransporter().verify();
    console.log("✅ Email (SMTP) service ready");
  } catch (error) {
    console.error("❌ Email service connection failed:", error);
  }
};


export const sendOtpEmail = async (
  toEmail: string,
  fullName: string,
  otp: string,
  expiresInMinutes: number = 10,
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"LMS Platform" <noreply@lms.com>',
    to: toEmail,
    subject: "🔐 Email Verification — Your OTP Code",
    html: buildOtpEmailHtml(fullName, otp, expiresInMinutes),
    text: buildOtpEmailText(fullName, otp, expiresInMinutes),
  };

  try {
    await getTransporter().sendMail(mailOptions);
    console.log(`📧 OTP email sent to ${toEmail}`);
  } catch (error) {
    console.warn(`\n[DEVELOPMENT] 📬 SMTP is not configured. Email verification OTP code for ${toEmail} is: ${otp}\n`);
  }
};


export const sendWelcomeEmail = async (
  toEmail: string,
  fullName: string,
): Promise<void> => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || '"LMS Platform" <noreply@lms.com>',
    to: toEmail,
    subject: "🎉 Welcome to LMS Platform!",
    html: buildWelcomeEmailHtml(fullName),
  };

  try {
    await getTransporter().sendMail(mailOptions);
  } catch (error) {
    console.warn(`\n[DEVELOPMENT] 📬 SMTP is not configured. Welcome email could not be sent to ${toEmail}\n`);
  }
};


const buildOtpEmailHtml = (
  name: string,
  otp: string,
  expiresInMinutes: number,
): string => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" role="presentation"
               style="background:#ffffff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:40px 32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;font-weight:700;letter-spacing:-0.5px;">
                📚 LMS Platform
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                Learning Management System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 32px;">
              <p style="margin:0 0 8px;color:#374151;font-size:16px;">
                Hi <strong>${name}</strong>,
              </p>
              <p style="margin:0 0 32px;color:#6b7280;font-size:15px;line-height:1.6;">
                Use the one-time code below to verify your email address.
                This code expires in <strong>${expiresInMinutes} minutes</strong>.
              </p>

              <!-- OTP Box -->
              <div style="background:#f5f3ff;border:2px dashed #7c3aed;border-radius:10px;
                          padding:28px;text-align:center;margin-bottom:32px;">
                <p style="margin:0 0 8px;color:#6d28d9;font-size:12px;
                           text-transform:uppercase;letter-spacing:2px;font-weight:600;">
                  Your Verification Code
                </p>
                <p style="margin:0;font-size:42px;font-weight:800;color:#4f46e5;
                           letter-spacing:12px;font-family:'Courier New',monospace;">
                  ${otp}
                </p>
              </div>

              <p style="margin:0 0 16px;color:#6b7280;font-size:13px;line-height:1.5;">
                ⚠️ Never share this code with anyone. Our team will never ask for it.
                If you did not request this, please ignore this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 32px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © ${new Date().getFullYear()} LMS Platform. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ─── Plain-text Fallback: OTP ─────────────────────────────────────────────────

const buildOtpEmailText = (
  name: string,
  otp: string,
  expiresInMinutes: number,
): string =>
  `Hi ${name},\n\nYour LMS email verification code is: ${otp}\n\n` +
  `This code expires in ${expiresInMinutes} minutes.\n\n` +
  `Never share this code with anyone.\n\n— LMS Platform Team`;

// ─── HTML Template: Welcome ───────────────────────────────────────────────────

const buildWelcomeEmailHtml = (name: string): string => `
<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="560" cellpadding="0" cellspacing="0"
               style="background:#fff;border-radius:12px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);
                       padding:40px 32px;text-align:center;">
              <h1 style="margin:0;color:#fff;font-size:28px;">🎉 Welcome aboard!</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 32px;">
              <p style="color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
              <p style="color:#6b7280;font-size:15px;line-height:1.6;">
                Your email has been verified and your LMS account is ready.
                Start exploring courses and level up your skills!
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
