// src/dao/Auth.dao.ts
import ResetPassModel from "../entities/ResetPass.entitiy.js";
import User from "../entities/User.entitiy.js";
import { logger } from "../utils/logger.js";

export default class AuthDao {
  private user!: typeof User;
  private Reset!: typeof ResetPassModel;
  constructor() {
    this.user = User;
    this.Reset = ResetPassModel;
  }

  async findByEmail(email: string) {
    try {
      logger.info("src->dao->auth.dao->findByEmail");
      return await this.user.findOne({ email });
    } catch (error) {
      logger.error("Error in findByEmail:", error);
      throw new Error("Failed to find user by email");
    }
  }
  async findResetPasswordByEmail(email: string) {
    try {
      logger.info("src->dao->auth.dao->findResetPasswordByEmail");
      return await this.Reset.findOne({ email });
    } catch (error) {
      logger.error("Error in findResetPasswordByEmail:", error);
      throw new Error("Failed to find user by email");
    }
  }

  async createUser(userData: any) {
    try {
      logger.info("src->dao->auth.dao->createUser");
      return await this.user.create(userData);
    } catch (error) {
      logger.error("Error in createUser:", error);
      throw new Error("Failed to create user");
    }
  }

  async verifyUser(email: string) {
    try {
      logger.info("src->dao->auth.dao->verifyUser");
      return await this.user.updateOne({ email }, { isVerified: true });
    } catch (error) {
      logger.error("Error in verifyUser:", error);
      throw new Error("Failed to verify user");
    }
  }
  async VerifyResetEmail(email: string) {
    try {
      logger.info("src->dao->auth.dao->VerifyResetEmail");
      return await this.Reset.updateOne({ email }, { isVerified: true });
    } catch (error) {
      logger.error("Error in verifyUser:", error);
      throw new Error("Failed to verify user");
    }
  }

  async updatePassword(email: string, hashedPassword: string) {
    try {
      logger.info("src->dao->auth.dao->updatePassword");
      const check: any = await this.Reset.findOne({ email });
      console.log(check);
      if (check.isVerified == true) {
        const data = await this.user.updateOne(
          { email },
          { password: hashedPassword }
        );
        this.Reset.deleteOne({ email });
        return data;
      }
      throw new Error("Email is not verified");
    } catch (error) {
      logger.error("Error in updatePassword:", error);
      throw new Error("Failed to update password");
    }
  }
}
