import { sendRentReminderEmail, sendPaymentDetailsUpdatedEmail, sendUserPaymentDueAdminEmail } from "../common/services/reminder.emai.js";
import { sendAdminNotificationEmail } from "../common/services/email.js";
import NotificationDao from "../dao/Notification.dao.js";
import UserDao from "../dao/User.dao.js";
import { logger } from "../utils/logger.js";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "anujkumar2632001@gmail.com";
const FRONTEND_BASE_URL = process.env.FRONTEND_URL || "https://motherhomes.co.in";

export default class NotificationService {
  private notificationDao: NotificationDao;
  private userDao: UserDao

  constructor() {
    this.notificationDao = new NotificationDao();
    this.userDao = new UserDao();
  }

  async createLeadNotification(data: {
    user_id?: string;
    property_id?: string;
    leadDetails?: string;
    lead_id?: string;
  }) {
    try {
      logger.info("src->services->notification.service->createLeadNotification");
      const description = "New Lead submitted";
      // Create notification record for admin dashboard
      await this.notificationDao.createNotification({
        user_id: data.user_id,
        property_id: data.property_id,
        description,
        adminOnly: true
      });
      // Send email to admin
      const actionUrl = `${FRONTEND_BASE_URL}/leads${data.lead_id ? `?search=${data.lead_id}` : ""}`;
      await sendAdminNotificationEmail(
        ADMIN_EMAIL,
        "New Lead Received — MotherHomes",
        `A new lead has been submitted${data.leadDetails ? `: <strong>${data.leadDetails}</strong>` : "."}`,
        actionUrl
      );
      return { success: true };
    } catch (error: any) {
      logger.error("Error creating lead notification");
      logger.debug(error);
      // Don't throw — notification failure should not block lead creation
    }
  }

  async createAppointmentNotification(data: {
    user_id: string;
    property_id: string;
    appointmentDetails?: string;
    appointment_id?: string;
  }) {
    try {
      logger.info("src->services->notification.service->createAppointmentNotification");
      const description = "New Appointment booked";
      const notification = await this.notificationDao.createNotification({
        user_id: data.user_id,
        property_id: data.property_id,
        description,
        adminOnly: true
      });
      // Send email to admin
      const actionUrl = `${FRONTEND_BASE_URL}/editappointments${data.appointment_id ? `?search=${data.appointment_id}` : ""}`;
      await sendAdminNotificationEmail(
        ADMIN_EMAIL,
        "New Appointment Booked — MotherHomes",
        `A new appointment has been booked${data.appointmentDetails ? `: <strong>${data.appointmentDetails}</strong>` : "."}`,
        actionUrl
      );
      return notification;
    } catch (error: any) {
      logger.error("Error creating appointment notification");
      logger.debug(error);
      // Don't throw — notification failure should not block appointment creation
    }
  }

  async createNotification(data: {
    user_id: string;
    property_id: string;
    description: string;
  }) {
    try {
      logger.info("src->services->notification.service->createNotification");

      const createdNotification = await this.notificationDao.createNotification(data);
      const User: any = await this.userDao.findByUserId(data.user_id);

      if (data.description === "Admin has updated the payment details") {
        await sendPaymentDetailsUpdatedEmail(User.email, User?.User_Name);
      } else {
        // Default: send rent reminder to user (legacy behavior)
        await sendRentReminderEmail(User.email, User?.User_Name);
      }
      return createdNotification;
    } catch (error: any) {
      logger.error("Error creating notification in notification.service->createNotification");
      logger.debug(error);
      throw new Error(error.message || "Notification creation failed");
    }
  }

  async updateNotificationById(id: string, data: any) {
    try {
      logger.info("src->services->notification.service->updateNotificationById");

      const updatedNotification = await this.notificationDao.updateNotificationById(id, data);
      if (!updatedNotification) {
        throw new Error("Notification not found");
      }

      return updatedNotification;
    } catch (error: any) {
      logger.error("Error updating notification in notification.service->updateNotificationById");
      logger.debug(error);
      throw new Error(error.message || "Notification update failed");
    }
  }

  async getNotificationsByUserId(userId: string) {
    try {
      logger.info("src->services->notification.service->getNotificationsByUserId");

      const notifications = await this.notificationDao.findByUserId(userId);
      return notifications;
    } catch (error: any) {
      logger.error("Error fetching notifications in notification.service->getNotificationsByUserId");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch notifications by userId");
    }
  }

  async getNotificationsByPropertyId(propertyId: string) {
    try {
      logger.info("src->services->notification.service->getNotificationsByPropertyId");

      const notifications = await this.notificationDao.findByPropertyId(propertyId);
      return notifications;
    } catch (error: any) {
      logger.error("Error fetching notifications in notification.service->getNotificationsByPropertyId");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch notifications by propertyId");
    }
  }

  async deleteNotificationById(id: string) {
    try {
      logger.info("src->services->notification.service->deleteNotificationById");

      const deletedNotification = await this.notificationDao.deleteNotification(id);
      return deletedNotification;
    } catch (error: any) {
      logger.error("Error deleting notification in notification.service->deleteNotificationById");
      logger.debug(error);
      throw new Error(error.message || "Failed to delete notification");
    }
  }

  async getAdminAndUserNotificationsByUserId(userId: string) {
    try {
      logger.info("src->services->notification.service->getAdminAndUserNotificationsByUserId");
      const notifications = await this.notificationDao.findByUserIdAdminOnly(userId);
      return notifications;
    } catch (error: any) {
      logger.error("Error fetching notifications in notification.service->getAdminAndUserNotificationsByUserId");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch admin and user notifications by userId");
    }
  }
}
