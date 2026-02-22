import { Request, Response } from "express";
import AuthService from "../services/Auth.services.js";
import { logger } from "../utils/logger.js";

export default class AuthController {
  private authService!: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  registerUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->auth.controller->registerUser");
      const { email, password, User_Name, phone_no } = req.body;

      if (!email || !password || !User_Name || !phone_no) {
        return res.status(400).json({ message: "All fields are required" });
      }

      if (String(phone_no).length !== 10) {
        return res.status(400).json({ message: "The phone number must contain exactly 10 digits" });
      }

      const createdUser = await this.authService.registerUser({
        email,
        password,
        User_Name,
        phone_no,
      });

      return res.status(201).json({ message: "User registered successfully", user: createdUser });
    } catch (error: any) {
      logger.error("Error in registerUser:", error);
      return res.status(500).json({ message: error.message || "Registration failed" });
    }
  };
  UpdateUserPass = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->auth.controller->UpdateUserPass");
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const UpdateUser = await this.authService.UserPassUpdate({
        email,
        password
      });

      return res.status(201).json({ message: "User password reset successfully", user: UpdateUser });
    } catch (error: any) {
      logger.error("Error in UpdateUserpass:", error);
      return res.status(500).json({ message: error.message || "Pssword reset failed" });
    }
  };
  VerifyUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->auth.controller->VerifyUser");
      const { email, otp } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email  is required" });
      }

      const verification = await this.authService.UserEmailVerificationEmailSend(email, otp);
      console.log(verification)
      return res.status(200).json({ message: "User verified" });
    } catch (error: any) {
      logger.error("Error in VerifyUser:", error);
      return res.status(401).json({ message: error.message || "Verification failed" });
    }
  };
  VerifyResetUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->auth.controller->VerifyResetUser");
      const { email, otp } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email  is required" });
      }

      const verification = await this.authService.UserResetEmailVerificationEmailSend(email, otp);
      console.log(verification)
      return res.status(200).json({ message: "User verified" });
    } catch (error: any) {
      logger.error("Error in VerifyUser:", error);
      return res.status(401).json({ message: error.message || "Verification failed" });
    }
  };

  loginUser = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->auth.controller->loginUser");
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const loginResult = await this.authService.loginUser({ email, password });

      return res.status(200).json({ message: "Login successful", token: loginResult.token, user: loginResult.user });
    } catch (error: any) {
      logger.error("Error in loginUser:", error);
      return res.status(401).json({ message: error.message || "Login failed" });
    }
  };

}
