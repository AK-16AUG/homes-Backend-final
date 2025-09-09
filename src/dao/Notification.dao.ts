import Notification from "../entities/notification.entity.js";
import { logger } from "../utils/logger.js";

export default class NotificationDao {
  private notification: typeof Notification;

  constructor() {
    this.notification = Notification;
  }

  async createNotification(notificationData: any) {
    try {
      logger.info("src->dao->notification.dao->createNotification");
      const data = await this.notification.create(notificationData);
      return data;
    } catch (error) {
      logger.error("Failed notification creation", error);
      throw new Error("Failed notification creation");
    }
  }

  async deleteNotification(id: string) {
    try {
      logger.info("src->dao->notification.dao->deleteNotification");
      return await this.notification.findByIdAndDelete(id);
    } catch (error) {
      logger.error("Failed deleting notification", error);
      throw new Error("Failed notification deletion");
    }
  }

  async findByUserId(userId: string) {
    try {
      logger.info("src->dao->notification.dao->findByUserId");
      return await this.notification.find({ user_id: userId }).populate("user_id","-password").populate("property_id");
    } catch (error) {
      logger.error("Failed finding notifications by userId", error);
      throw new Error("Failed to find notifications");
    }
  }
    async findByUserIdAdminOnly(userId: string) {
    try {
      logger.info("src->dao->notification.dao->findByUserIdAdminOnly");
     const data=await this.notification.find({ user_id: userId }).populate("user_id","-password").populate("property_id").sort({createdAt:-1});
     const adminData = await this.notification
       .find({ adminOnly: true })
       .populate("user_id", "-password")
       .populate("property_id").sort({createdAt:-1});
     return [
      ...data,
      ...adminData
     ]
    } catch (error) {
      logger.error("Failed finding notifications by userId", error);
      throw new Error("Failed to find notifications");
    }
  }

  async findByPropertyId(propertyId: string) {
    try {
      logger.info("src->dao->notification.dao->findByPropertyId");
      return await this.notification.find({ property_id: propertyId });
    } catch (error) {
      logger.error("Failed finding notifications by propertyId", error);
      throw new Error("Failed to find notifications");
    }
  }

  async updateNotificationById(id: string, updateData: any) {
    try {
      logger.info("src->dao->notification.dao->updateNotificationById");
      return await this.notification.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      logger.error("Failed updating notification", error);
      throw new Error("Failed to update notification");
    }
  }
}
