import nodemailer, { SentMessageInfo } from "nodemailer";
import dotenv from "dotenv";
import { IAppointment } from "../../entities/appointment.entity";

dotenv.config();

interface EmailResult {
  success: boolean;
  message: string;
  error?: any;
}

interface EmailAppointmentDetails {
  property_name: string;
  scheduleTime: Date | string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Rescheduled";
  newScheduleTime?: Date | string;
  phone?: string;
  whatsappUpdates?: boolean;
}

const APPOINTMENT_STATUS_TEMPLATE = (
  username: string,
  appointmentDetails: EmailAppointmentDetails
) => {
  const formatDate = (date?: Date | string) => {
    if (!date) return "Not specified";
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid date";
    return dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (date?: Date | string) => {
    if (!date) return "Not specified";
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return "Invalid time";
    return dateObj.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusColors: Record<string, string> = {
    Pending: "#f0ad4e",
    Confirmed: "#5cb85c",
    Cancelled: "#d9534f",
    Rescheduled: "#0275d8",
  };

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <style>
    body {
      font-family: Arial, Helvetica, sans-serif;
      background-color: #f9fafb;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    .header {
      background: #13072E;
      color: white;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      margin: 0;
      font-size: 22px;
    }
    .content {
      padding: 20px;
      color: #333;
    }
    .greeting {
      font-size: 16px;
      margin-bottom: 12px;
    }
    .message {
      font-size: 15px;
      line-height: 1.6;
      margin-bottom: 18px;
    }
    .appointment-card {
      background: #f5f7fa;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 14px;
    }
    .detail-label {
      font-weight: bold;
      color: #444;
    }
    .status-badge {
      padding: 5px 12px;
      border-radius: 6px;
      color: white;
      font-weight: bold;
      display: inline-block;
    }
    .button {
      display: inline-block;
      padding: 12px 20px;
      background-color: #13072E;
      color: white !important;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      margin-top: 10px;
    }
    .button:hover {
      background-color: #2a145c;
    }
    .footer {
      text-align: center;
      font-size: 13px;
      color: #666;
      padding: 20px;
      background: #f1f3f6;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Property Appointment Update</h1>
    </div>

    <div class="content">
      <p class="greeting">Dear ${username},</p>

      <p class="message">Here are the latest details for your property viewing appointment:</p>

      <div class="appointment-card">
        <div class="detail-row">
          <span class="detail-label">Property:</span>
          <span>${appointmentDetails.property_name || "Not specified"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Scheduled Time:</span>
          <span>${formatDate(appointmentDetails.scheduleTime)} at ${formatTime(appointmentDetails.scheduleTime)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="status-badge" style="background:${statusColors[appointmentDetails.status]}">
            ${appointmentDetails.status}
          </span>
        </div>
        ${
          appointmentDetails.status === "Rescheduled" && appointmentDetails.newScheduleTime
            ? `<div class="detail-row">
                <span class="detail-label">New Time:</span>
                <span>${formatDate(appointmentDetails.newScheduleTime)} at ${formatTime(appointmentDetails.newScheduleTime)}</span>
              </div>`
            : ""
        }
        ${
          appointmentDetails.phone
            ? `<div class="detail-row">
                <span class="detail-label">Contact Phone:</span>
                <span>${appointmentDetails.phone}</span>
              </div>`
            : ""
        }
      </div>

      <p class="message">
        ${
          appointmentDetails.status === "Pending"
            ? "Your appointment is pending confirmation. We'll notify you once it's confirmed."
            : appointmentDetails.status === "Confirmed"
            ? "Your appointment has been confirmed! We look forward to showing you the property."
            : appointmentDetails.status === "Cancelled"
            ? "Your appointment has been cancelled. Please contact us if you'd like to reschedule."
            : "Your appointment has been rescheduled. Please make note of the new time."
        }
      </p>

      <a href="${process.env.CONTACT_LINK || "#"}" class="button">Contact Us</a>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || "Your Company"}. All rights reserved.</p>
      ${
        appointmentDetails.whatsappUpdates
          ? "<p>You are subscribed to WhatsApp updates for this appointment.</p>"
          : ""
      }
    </div>
  </div>
</body>
</html>
  `;
};


// Configure transporter (same as before)
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
transporter.verify((error) => {
  if (error) {
    console.error("Email server connection failed:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});

// Function to send appointment status email
export const sendAppointmentStatusEmail = async (
  appointment: IAppointment,
  user: { User_Name: string; email: string },
  property: any
): Promise<EmailResult> => {
  try {
    if (!appointment || !user || !property) {
      throw new Error("Appointment, user, and property details are required");
    }

    // Ensure schedule_Time is properly initialized
   

    const appointmentDetails: EmailAppointmentDetails = {
      property_name: property.property_name || "Unknown Property",
      scheduleTime: appointment.schedule_Time,
      status: appointment.status as "Pending" | "Confirmed" | "Cancelled" | "Rescheduled",
      phone: appointment.phone,
      whatsappUpdates: appointment.whatsappUpdates,
      ...(appointment.status === "Rescheduled" && { 
        newScheduleTime: appointment.schedule_Time
      })
    };

    const htmlContent = APPOINTMENT_STATUS_TEMPLATE(user.User_Name, appointmentDetails);

    const statusSubjectMap: Record<string, string> = {
      Pending: "Your Property Viewing Appointment is Pending",
      Confirmed: "Your Property Viewing Appointment is Confirmed",
      Cancelled: "Your Property Viewing Appointment is Cancelled",
      Rescheduled: "Your Property Viewing Appointment Has Been Rescheduled"
    };

    const subject = statusSubjectMap[appointment.status] || "Appointment Status Update";

    const mailOptions = {
      from: `"${process.env.APP_NAME || "Your Company"}" <${process.env.EMAIL}>`,
      to: user.email,
      subject,
      html: htmlContent,
      priority: "high" as const,
    };

    const info: SentMessageInfo = await transporter.sendMail(mailOptions);
    console.log("Appointment status email sent: %s", info.messageId);

    return {
      success: true,
      message: "Appointment status email sent successfully",
    };
  } catch (error) {
    console.error("Error sending appointment status email:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to send appointment status email",
      error,
    };
  }
};