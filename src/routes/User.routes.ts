import { Router } from "express";
import UserController from "../controller/User.controller.js";
import asyncHandler from "../utils/asyncHandler.js";
import { authMiddleware, authorizeRoles } from "../middleware/Auth.middleware.js";

const userRouter = Router();
const userController = new UserController();

// Create user
userRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    await userController.createUser(req, res);
  })
);

// Get all admins (must be above parameterized routes)
userRouter.get(
  "/admins",
  asyncHandler(async (req, res) => {
    await userController.getAllAdmins(req, res);
  })
);

// Get user by ID
userRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    await userController.getUserById(req, res);
  })
);
userRouter.put(
  "/:id",
  asyncHandler(async (req, res) => {
    await userController.updateUser(req, res);
  })
);

// Get user by email
userRouter.get(
  "/email/:email",
  asyncHandler(async (req, res) => {
    await userController.getUserByEmail(req, res);
  })
);
userRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    await userController.getAllUsers(req, res);
  })
);


// Admin management (superadmin only)
userRouter.post(
  "/admin",
  authMiddleware,
  authorizeRoles("superadmin", "admin"),
  asyncHandler(async (req, res) => {
    await userController.createAdmin(req, res);
  })
);
userRouter.put(
  "/admin/:id",
  authMiddleware,
  authorizeRoles("superadmin", "admin"),
  asyncHandler(async (req, res) => {
    await userController.updateAdmin(req, res);
  })
);
userRouter.delete(
  "/admin/:id",
  authMiddleware,
  authorizeRoles("superadmin", "admin"),
  asyncHandler(async (req, res) => {
    await userController.deleteAdmin(req, res);
  })
);

export default userRouter;
