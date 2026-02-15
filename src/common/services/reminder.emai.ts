import nodemailer, { SentMessageInfo } from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

interface EmailResult {
  success: boolean;
  message: string;
  error?: any;
}

const RENT_REMINDER_TEMPLATE = (username: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Rent Due Reminder</title>
  <style>
    body { font-family: Arial, sans-serif; background-color:#f9fafb; margin:0; padding:0; }
    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:12px; box-shadow:0 4px 8px rgba(0,0,0,0.05); overflow:hidden; }
    .header { background:#4f46e5; padding:20px; text-align:center; }
    .header h1 { margin:0; font-size:22px; color:#fff; }
    .content { padding:25px; color:#333; }
    .greeting { font-size:16px; margin-bottom:15px; }
    .message { font-size:15px; margin-bottom:20px; line-height:1.6; }
    .highlight { color:#4f46e5; font-weight:bold; }
    .button { display:inline-block; padding:12px 20px; background:#4f46e5; color:white!important; text-decoration:none; border-radius:6px; font-weight:bold; }
    .footer { background:#f1f3f6; padding:15px; font-size:12px; text-align:center; color:#555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Rent Payment Reminder</h1></div>
    <div class="content">
      <p class="greeting">Dear ${username},</p>
      <p class="message">This is a friendly reminder that your rent payment is <span class="highlight">due soon</span>. Please submit your payment promptly to avoid late fees.</p>
      <p class="message">If you’ve already paid, kindly disregard this message. Thank you for your timely attention.</p>
      <a href="${process.env.PAYMENT_PORTAL || "#"}" class="button">Make Payment</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} MotherHomes.co.in. All rights reserved.
    </div>
  </div>
</body>
</html>`;


const PAYMENT_DETAILS_UPDATED_TEMPLATE = (username: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Payment Details Updated</title>
  <style>
    body { font-family: Arial, sans-serif; background-color:#f9fafb; margin:0; padding:0; }
    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:12px; box-shadow:0 4px 8px rgba(0,0,0,0.05); overflow:hidden; }
    .header { background:#059669; padding:20px; text-align:center; }
    .header h1 { margin:0; font-size:22px; color:#fff; }
    .content { padding:25px; color:#333; }
    .greeting { font-size:16px; margin-bottom:15px; }
    .message { font-size:15px; margin-bottom:20px; line-height:1.6; }
    .button { display:inline-block; padding:12px 20px; background:#059669; color:white!important; text-decoration:none; border-radius:6px; font-weight:bold; }
    .footer { background:#f1f3f6; padding:15px; font-size:12px; text-align:center; color:#555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Payment Details Updated</h1></div>
    <div class="content">
      <p class="greeting">Dear ${username},</p>
      <p class="message">Your payment details have been updated by the admin. Please review your account to ensure accuracy. If you have questions, contact support.</p>
      <a href="${process.env.ACCOUNT_PORTAL || "#"}" class="button">View Account</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${process.env.APP_NAME || "Your Company"}. All rights reserved.
    </div>
  </div>
</body>
</html>`;


const USER_PAYMENT_DUE_ADMIN_TEMPLATE = (username: string, userEmail: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>User Rent Payment Due</title>
  <style>
    body { font-family: Arial, sans-serif; background-color:#f9fafb; margin:0; padding:0; }
    .container { max-width:600px; margin:20px auto; background:#fff; border-radius:12px; box-shadow:0 4px 8px rgba(0,0,0,0.05); overflow:hidden; }
    .header { background:#f59e42; padding:20px; text-align:center; }
    .header h1 { margin:0; font-size:22px; color:#fff; }
    .content { padding:25px; color:#333; }
    .greeting { font-size:16px; margin-bottom:15px; }
    .message { font-size:15px; margin-bottom:20px; line-height:1.6; }
    .user-card { background:#fdf4e7; padding:15px; border-radius:8px; margin-bottom:20px; }
    .footer { background:#f1f3f6; padding:15px; font-size:12px; text-align:center; color:#555; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>Rent Payment Due Alert</h1></div>
    <div class="content">
      <p class="greeting">Hello Admin,</p>
      <p class="message">The following user has a pending rent payment:</p>
      <div class="user-card">
        <strong>Name:</strong> ${username}<br>
        <strong>Email:</strong> ${userEmail}
      </div>
      <p class="message">Please follow up with the tenant at the earliest.</p>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${process.env.APP_NAME || "Your Company"}. All rights reserved.
    </div>
  </div>
</body>
</html>`;


// Configure transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter
// Verify transporter
transporter.verify((error) => {
  if (error) {
    if (error.message.includes("Username and Password not accepted") || error.message.includes("Invalid login")) {
      console.warn("⚠️  Email configuration issue: Invalid credentials. Email features will not work.");
    } else {
      console.warn("⚠️  Email server connection failed:", error.message);
    }
  } else {
    console.log("✅ Email server is ready to send reminders");
  }
});

// Function to send rent reminder email
export const sendRentReminderEmail = async (
  to: string,
  username: string
): Promise<EmailResult> => {
  try {
    if (!to || !username) {
      throw new Error("Recipient email and username are required");
    }

    const htmlContent = RENT_REMINDER_TEMPLATE(username);

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Your Company"}" <${process.env.EMAIL}>`,
      to,
      subject: "Your Rent Payment is Due",
      html: htmlContent,
      priority: "high" as const,
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Rent reminder sent: %s", info.messageId);

    return {
      success: true,
      message: "Rent reminder email sent successfully",
    };
  } catch (error) {
    console.error("Error sending rent reminder email:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send rent reminder email",
      error,
    };
  }
};

export const sendPaymentDetailsUpdatedEmail = async (
  to: string,
  username: string
): Promise<EmailResult> => {
  try {
    if (!to || !username) {
      throw new Error("Recipient email and username are required");
    }
    const htmlContent = PAYMENT_DETAILS_UPDATED_TEMPLATE(username);
    const mailOptions = {
      from: `"${process.env.APP_NAME || "Your Company"}" <${process.env.EMAIL}>`,
      to,
      subject: "Your Payment Details Have Been Updated",
      html: htmlContent,
      priority: "high" as const,
    };
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Payment details updated email sent: %s", info.messageId);
    return {
      success: true,
      message: "Payment details updated email sent successfully",
    };
  } catch (error) {
    console.error("Error sending payment details updated email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send payment details updated email",
      error,
    };
  }
};

export const sendUserPaymentDueAdminEmail = async (
  to: string,
  username: string,
  userEmail: string
): Promise<EmailResult> => {
  try {
    if (!to || !username || !userEmail) {
      throw new Error("Admin email, username, and user email are required");
    }
    const htmlContent = USER_PAYMENT_DUE_ADMIN_TEMPLATE(username, userEmail);
    const mailOptions = {
      from: `"${process.env.APP_NAME || "Your Company"}" <${process.env.EMAIL}>`,
      to,
      subject: "A User's Rent Payment is Due",
      html: htmlContent,
      priority: "high" as const,
    };
    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("User payment due admin email sent: %s", info.messageId);
    return {
      success: true,
      message: "User payment due admin email sent successfully",
    };
  } catch (error) {
    console.error("Error sending user payment due admin email:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to send user payment due admin email",
      error,
    };
  }
};
