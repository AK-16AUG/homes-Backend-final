import UserDao from "../dao/User.dao.js";
import { logger } from "../utils/logger.js";
  import bcrypt from "bcrypt";
interface PaginationParams {
  page: number;
  limit: number;
}
export default class UserService {
  private userDao: UserDao;

  constructor() {
    this.userDao = new UserDao();
  }

  async createUser(data: {
    email: string;
    password: string;
    User_Name: string;
    phone_no: number;
    isVerified?: boolean;
  }) {
    try {
      logger.info("src->services->user.service->createUser");

      const createdUser = await this.userDao.createUser(data);
      return createdUser;
    } catch (error: any) {
      logger.error("Error creating user in user.service->createUser");
      logger.debug(error);
      throw new Error(error.message || "User creation failed");
    }
  }



// inside the class UserService
async updateUserById(id: string, data: any) {
  try {
    logger.info("src->services->user.service->updateUserById");

    if (data.password) {
      // Hash the new password if it is provided
      data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await this.userDao.updateUserById(id, data);
    if (!updatedUser) {
      throw new Error("User not found");
    }

    return updatedUser;
  } catch (error: any) {
    logger.error("Error updating user in user.service->updateUserById");
    logger.debug(error);
    throw new Error(error.message || "User update failed");
  }
}

  async getUserByEmail(email: string) {
    try {
      logger.info("src->services->user.service->getUserByEmail");

      const user = await this.userDao.findByEmail(email);
      if (!user) {
        throw new Error("User not found with the given email");
      }

      return user;
    } catch (error: any) {
      logger.error("Error fetching user by email in user.service->getUserByEmail");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch user");
    }
  }

  async getUserById(id: string) {
    try {
      logger.info("src->services->user.service->getUserById");

      const user = await this.userDao.findByUserId(id);
      if (!user) {
        throw new Error("User not found with the given ID");
      }

      return user;
    } catch (error: any) {
      logger.error("Error fetching user by ID in user.service->getUserById");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch user by ID");
    }
  }

  async createAdmin(data: {
    email: string;
    password: string;
    User_Name: string;
    phone_no: number;
    role: string;
    isVerified?: boolean;
  }) {
    try {
      logger.info("src->services->user.service->createAdmin");
      data.password = await bcrypt.hash(data.password, 10);
      const createdAdmin = await this.userDao.createUser({ ...data, role: "admin" });
      return createdAdmin;
    } catch (error: any) {
      logger.error("Error creating admin in user.service->createAdmin");
      logger.debug(error);
      throw new Error(error.message || "Admin creation failed");
    }
  }

  async updateAdminById(id: string, data: any) {
    try {
      logger.info("src->services->user.service->updateAdminById");
      if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
      }
      // Ensure role stays admin
      data.role = "admin";
      const updatedAdmin = await this.userDao.updateUserById(id, data);
      if (!updatedAdmin) {
        throw new Error("Admin not found");
      }
      return updatedAdmin;
    } catch (error: any) {
      logger.error("Error updating admin in user.service->updateAdminById");
      logger.debug(error);
      throw new Error(error.message || "Admin update failed");
    }
  }

  async deleteUserById(id: string) {
    try {
      logger.info("src->services->user.service->deleteUserById");
      return await this.userDao.deleteUserById(id);
    } catch (error: any) {
      logger.error("Error deleting user in user.service->deleteUserById");
      logger.debug(error);
      throw new Error(error.message || "User deletion failed");
    }
  }

  async getAllAdmins() {
    try {
      logger.info("src->services->user.service->getAllAdmins");
      return await this.userDao.getAllAdmins();
    } catch (error: any) {
      logger.error("Error fetching all admins in user.service->getAllAdmins");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch admins");
    }
  }
  async getAllUsers({ page, limit }: PaginationParams) {
    try {
      logger.info("src->services->user.service->getAllUsers");
      return await this.userDao.getAllUsers({ page, limit });
    } catch (error: any) {
      logger.error("Error fetching all Users in user.service->getAllUsers");
      logger.debug(error);
      throw new Error(error.message || "Failed to fetch Users");
    }
  }
}
