import { sendRentReminderEmail, sendPaymentDetailsUpdatedEmail, sendUserPaymentDueAdminEmail } from "../common/services/reminder.emai.js";
import NotificationDao from "../dao/Notification.dao.js";
import UserDao from "../dao/User.dao.js";
import { logger } from "../utils/logger.js";

export default class NotificationService {
  private notificationDao: NotificationDao;
  private userDao:UserDao

  constructor() {
    this.notificationDao = new NotificationDao();
    this.userDao= new UserDao();
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
