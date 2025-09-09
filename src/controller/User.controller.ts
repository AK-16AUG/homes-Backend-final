import { Request, Response } from "express";
import UserService from "../services/User.service.js";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const userService = new UserService();

export default class UserController {
  async createUser(req: Request, res: Response) {
    try {
      const user = await userService.createUser(req.body);
      return res.status(statusCode.CREATED).json({ message: "User created successfully", user });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }
async updateUser(req: Request, res: Response) {
  try {
    const user = await userService.updateUserById(req.params.id, req.body);
    return res.status(statusCode.OK).json({ message: "User updated successfully", user });
  } catch (error: any) {
    return res.status(statusCode.NOT_FOUND).json({
      error: errorResponse.USER_NOT_FOUND,
      message: error.message,
    });
  }
}

  async getUserByEmail(req: Request, res: Response) {
    try {
      const { email } = req.params;
      const user = await userService.getUserByEmail(email);
      return res.status(statusCode.OK).json(user);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.USER_NOT_FOUND ,
        message: error.message,
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(statusCode.OK).json(user);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.USER_NOT_FOUND ,
        message: error.message,
      });
    }
  }

  async createAdmin(req: Request, res: Response) {
    try {
      console.log(req.body);
      const admin = await userService.createAdmin(req.body);
      return res.status(statusCode.CREATED).json({ message: "Admin created successfully", admin });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateAdmin(req: Request, res: Response) {
    try {
      const admin = await userService.updateAdminById(req.params.id, req.body);
      return res.status(statusCode.OK).json({ message: "Admin updated successfully", admin });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.USER_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async deleteAdmin(req: Request, res: Response) {
    try {
      await userService.deleteUserById(req.params.id);
      return res.status(statusCode.OK).json({ message: "Admin deleted successfully" });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.USER_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getAllAdmins(req: Request, res: Response) {
    try {
      const admins = await userService.getAllAdmins();
      return res.status(statusCode.OK).json(admins);
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
   async getAllUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const Users = await userService.getAllUsers({ page, limit });
      return res.status(statusCode.OK).json(Users);
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}
