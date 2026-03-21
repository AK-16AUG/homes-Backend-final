import * as nodemailer from "nodemailer";
import * as dotenv from "dotenv";
import { logger } from "../../utils/logger.js";

dotenv.config();

// Re-using the same Gmail transporter configuration already present in the project
const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL,
        pass: process.env.APP_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

interface EmailResult {
    success: boolean;
    message: string;
    error?: any;
}

export const sendAdminInquiryNotification = async (leadData: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    searchQuery?: string;
}): Promise<EmailResult> => {
    try {
        const adminEmail = process.env.ADMIN_EMAIL || 'motherhomes1608@gmail.com';

        logger.info(`Attempting to send admin notification to: ${adminEmail} via Gmail/Nodemailer`);

        const mailOptions = {
            from: `"${process.env.APP_NAME || "MotherHomes"}" <${process.env.EMAIL}>`,
            to: adminEmail,
            subject: `New Lead Inquiry: ${leadData.name || 'Anonymous'}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 20px; border-radius: 10px;">
          <h1 style="color: #2d3748; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">New Lead Alert!</h1>
          <p style="font-size: 16px; color: #4a5568;">A new inquiry has been submitted through the website pop-up.</p>
          <div style="background-color: #f7fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${leadData.name || 'N/A'}</p>
            <p><strong>Email:</strong> ${leadData.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${leadData.phone || 'N/A'}</p>
            <p><strong>Location:</strong> ${leadData.location || 'N/A'}</p>
            <p><strong>Search Query:</strong> ${leadData.searchQuery || 'N/A'}</p>
          </div>
          <p style="font-size: 14px; color: #718096; margin-top: 20px; text-align: center;">
            Please check the admin dashboard for more details.
          </p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        logger.info("Admin inquiry notification sent via Gmail. ID:", info.messageId);

        return {
            success: true,
            message: "Inquiry notification sent successfully via Gmail",
        };
    } catch (error) {
        logger.error("Error sending admin inquiry notification via Gmail:", error);
        return {
            success: false,
            message: error instanceof Error ? error.message : "Failed to send notification via Gmail",
            error,
        };
    }
};
