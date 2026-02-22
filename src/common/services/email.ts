import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Resend } from 'resend';

// Initialize environment variables
dotenv.config();

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY is not defined in environment variables. Admin notifications will be skipped.");
}

interface EmailResult {
  success: boolean;
  message: string;
  error?: any;
}

const EMAIL_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Verification</title>
  <style>
    body {
      background-color: #f4f4f7;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 0;
      line-height: 1.6;
      color: #333333;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #2d3748;
    }
    .otp-box {
      display: inline-block;
      font-size: 28px;
      letter-spacing: 8px;
      font-weight: bold;
      background-color: #f1f1f1;
      padding: 15px 25px;
      border-radius: 8px;
      margin: 20px 0;
      color: #000;
    }
    .footer {
      margin-top: 40px;
      font-size: 12px;
      color: #777;
      text-align: center;
    }
    @media (max-width: 600px) {
      .container {
        padding: 20px;
        margin: 20px auto;
      }
      .otp-box {
        font-size: 24px;
        letter-spacing: 6px;
        padding: 12px 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Email Verification Code</h1>
    <p>Hello,</p>
    <p>Thank you for registering with us! Please use the OTP below to verify your email address. This code is valid for the next 10 minutes:</p>
    <div class="otp-box">[OTP_CODE]</div>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <div class="footer">
      <p>© ${new Date().getFullYear()} MotherHomes.co.in. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' service
  host: 'smtp.gmail.com', // Gmail SMTP server
  port: 587, // Standard secure port
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // From environment variables
    pass: process.env.APP_PASS // Your app-specific password
  },
  tls: {
    rejectUnauthorized: false // Only for testing, remove in production
  }
});
// Verify connection configuration
// Verify connection configuration
transporter.verify((error) => {
  if (error) {
    if (error.message.includes("Username and Password not accepted") || error.message.includes("Invalid login")) {
      console.warn("⚠️  Email configuration issue: Invalid credentials. Email features will not work.");
    } else {
      console.warn("⚠️  Email server connection failed:", error.message);
    }
  } else {
    console.log("✅ Email server is ready to take our messages");
  }
});

export const sendAdminNotificationEmail = async (
  to: string,
  subject: string,
  body: string,
  actionUrl?: string
): Promise<EmailResult> => {
  try {
    if (!to) {
      throw new Error("Recipient email is required");
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { background-color: #f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; line-height: 1.6; color: #333333; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
    h1 { font-size: 22px; margin-bottom: 16px; color: #2d3748; border-bottom: 2px solid #f0f0f0; padding-bottom: 12px; }
    .body-text { font-size: 15px; color: #444; margin-bottom: 20px; }
    .btn { display: inline-block; background: #3b82f6; color: #ffffff !important; padding: 12px 24px; border-radius: 6px; font-weight: 600; text-decoration: none; margin-top: 10px; }
    .footer { margin-top: 40px; font-size: 12px; color: #777; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🔔 ${subject}</h1>
    <p class="body-text">${body}</p>
    ${actionUrl ? `<a href="${actionUrl}" class="btn">View Details</a>` : '<p class="body-text">Please log in to the admin portal to view the details.</p>'}
    <div class="footer">
      <p>© ${new Date().getFullYear()} MotherHomes.co.in. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;

    if (!resend) {
      console.warn("Resend is not initialized. Skipping admin notification.");
      return {
        success: false,
        message: "Resend not initialized due to missing API key",
      };
    }

    const { data, error } = await resend.emails.send({
      from: 'MotherHomes <onboarding@resend.dev>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message);
    }

    console.log("Admin notification email sent via Resend: %s", data?.id);

    return {
      success: true,
      message: "Admin notification email sent successfully via Resend",
    };
  } catch (error) {
    console.error("Error sending admin notification email via Resend:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send admin notification email",
      error,
    };
  }
};

export const sendOtpEmail = async (to: string, otp: string): Promise<EmailResult> => {
  try {
    if (!to || !otp) {
      throw new Error("Recipient email and OTP are required");
    }

    const htmlContent = EMAIL_TEMPLATE.replace("[OTP_CODE]", otp);

    const mailOptions: any = {
      from: `"${process.env.APP_NAME || "Your Company"}" <${process.env.EMAIL}>`,
      to,
      subject: "Your Email Verification Code",
      html: htmlContent,
      priority: 'high',
    };

    const info: any = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);

    return {
      success: true,
      message: "OTP email sent successfully",
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send OTP email",
      error,
    };
  }
};
