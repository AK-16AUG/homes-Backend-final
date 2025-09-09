import { Request, Response } from "express";
import NotificationService from "../services/Notification.service.js";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const notificationService = new NotificationService();

export default class NotificationController {
  async createNotification(req: Request, res: Response) {
    try {
      const notification = await notificationService.createNotification(req.body);
      return res.status(statusCode.CREATED).json({
        message: "Notification created successfully",
        notification,
      });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateNotification(req: Request, res: Response) {
    try {
      const notification = await notificationService.updateNotificationById(req.params.id, req.body);
      return res.status(statusCode.OK).json({
        message: "Notification updated successfully",
        notification,
      });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.NOTIFICATION_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getNotificationsByUserId(req: Request, res: Response) {
    try {
      const notifications = await notificationService.getNotificationsByUserId(req.params.userId);
      return res.status(statusCode.OK).json(notifications);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.NOTIFICATION_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getNotificationsByPropertyId(req: Request, res: Response) {
    try {
      const notifications = await notificationService.getNotificationsByPropertyId(req.params.propertyId);
      return res.status(statusCode.OK).json(notifications);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.NOTIFICATION_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async deleteNotification(req: Request, res: Response) {
    try {
      await notificationService.deleteNotificationById(req.params.id);
      return res.status(statusCode.OK).json({
        message: "Notification deleted successfully",
      });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.NOTIFICATION_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getAdminAndUserNotificationsByUserId(req: Request, res: Response) {
    try {
      const notifications = await notificationService.getAdminAndUserNotificationsByUserId(req.params.userId);
      return res.status(statusCode.OK).json(notifications);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.NOTIFICATION_NOT_FOUND,
        message: error.message,
      });
    }
  }
}
