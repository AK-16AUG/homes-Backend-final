import { Router } from "express";
import NotificationController from "../controller/Notification.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../middleware/Auth.middleware.js";

const notificationRouter = Router();
const notificationController = new NotificationController();

notificationRouter.post(
  "/",authMiddleware,authorizeRoles("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    await notificationController.createNotification(req, res);
  })
);

notificationRouter.get(
  "/user/:userId",
  asyncHandler(async (req, res) => {
    await notificationController.getNotificationsByUserId(req, res);
  })
);

notificationRouter.get(
  "/user/:userId/admin",authMiddleware,authorizeRoles("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    await notificationController.getAdminAndUserNotificationsByUserId(req, res);
  })
);

notificationRouter.get(
  "/property/:propertyId",authMiddleware,
  asyncHandler(async (req, res) => {
    await notificationController.getNotificationsByPropertyId(req, res);
  })
);

notificationRouter.put(
  "/:id",authMiddleware,authorizeRoles("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    await notificationController.updateNotification(req, res);
  })
);

notificationRouter.delete(
  "/:id",authMiddleware,authorizeRoles("admin", "superadmin"),
  asyncHandler(async (req, res) => {
    await notificationController.deleteNotification(req, res);
  })
);

export default notificationRouter;
