import User from "../entities/User.entitiy.js";
import { logger } from "../utils/logger.js";

interface PaginationParams {
  page: number;
  limit: number;
}

export default class UserDao {
  private user: typeof User;

  constructor() {
    this.user = User;
  }

  async createUser(userData: any) {
    try {
      logger.info("src->dao->user.dao->createUser");
      // Check if user already exists
      const existingUser = await this.user.findOne({ email: userData.email });
      if (existingUser) {
        throw new Error("User already exists");
      }

      const data = await this.user.create(userData);
      return data;
    } catch (error) {
      logger.error("Failed user creation", error);
      throw new Error("Failed user creation");
    }
  }
  async DeleteUser(email: any) {
    try {
      logger.info("src->dao->user.dao->DeleteUser");
      const data = await this.user.deleteOne({ email });
      return data;
    } catch (error) {

      logger.error("Failed user deletionn", error);
      throw new Error("Failed user deletion");
    }
  }

  async findByEmail(email: string) {
    try {
      logger.info("src->dao->user.dao->findByEmail");
      return await this.user.findOne({ email: email.toLowerCase() });
    } catch (error) {
      logger.error("Failed finding user by email", error);
      throw new Error("Failed to find user");
    }
  }
  async findByUserId(id: string) {
    try {
      logger.info("src->dao->user.dao->findByUserId");
      return await this.user.findById(id);
    } catch (error) {
      logger.error("Failed finding user by id", error);
      throw new Error("Failed to find user");
    }
  }
  async findByUserEmailAndUpdate(email: string) {
    try {
      logger.info("src->dao->user.dao->findByUserEmailAndUpdate");
      console.log(email);
      return await this.user.findOneAndUpdate({ email }, { isVerified: true });
    } catch (error) {
      logger.error("Failed finding user by email and update", error);
      throw new Error("Failed to find user");
    }
  }
  async updateUserById(id: string, updateData: any) {
    try {
      logger.info("src->dao->user.dao->updateUserById");
      return await this.user.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      logger.error("Failed updating user", error);
      throw new Error("Failed to update user");
    }
  }

  async deleteUserById(id: string) {
    try {
      logger.info("src->dao->user.dao->deleteUserById");
      return await this.user.findByIdAndDelete(id);
    } catch (error) {
      logger.error("Failed user deletion by id", error);
      throw new Error("Failed user deletion by id");
    }
  }
  async getAllUsers({ page = 1, limit = 10 }: PaginationParams) {
    try {
      logger.info("src->dao->user.dao->getAllUsers");
      const skip = (page - 1) * limit;
      const users = await this.user.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
      const total = await this.user.countDocuments();
      return {
        users,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      logger.error("Failed to fetch users", error);
      throw new Error("Failed to fetch users");
    }
  }

  async getAllAdmins() {
    try {
      logger.info("src->dao->user.dao->getAllAdmins");
      return await this.user.find({ role: "admin" });
    } catch (error) {
      logger.error("Failed to fetch admins", error);
      throw new Error("Failed to fetch admins");
    }
  }

}
