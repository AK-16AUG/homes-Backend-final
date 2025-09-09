import { Router } from "express";
import AuthController from "../controller/Auth.controller.js";
import asyncHandler from "../utils/asyncHandler.js";

const authRouter = Router();
const authController = new AuthController();

// Register User
authRouter.post(
  "/createUser",
  asyncHandler((req, res) => authController.registerUser(req, res))
);

// Login User
authRouter.post(
  "/loginUser",
  asyncHandler((req, res) => authController.loginUser(req, res))
);

// Verify User (e.g. after registration)
authRouter.post(
  "/verifyUser",
  asyncHandler((req, res) => authController.VerifyUser(req, res))
);

// Update User Password (reset/forgot)
authRouter.post(
  "/updateUserPass",
  asyncHandler((req, res) => authController.UpdateUserPass(req, res))
);

// Verify User For Reset Password
authRouter.post(
  "/verifyResetUser",
  asyncHandler((req, res) => authController.VerifyResetUser(req, res))
);

export default authRouter;
