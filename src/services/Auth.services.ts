import AuthDao from "../dao/Auth.dao.js";
import UserDao from "../dao/User.dao.js";
import { logger } from "../utils/logger.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv"
dotenv.config();
export default class AuthService {
  private Userdao: UserDao;
  private Authdao: AuthDao;

  constructor() {
    this.Userdao = new UserDao();
    this.Authdao = new AuthDao();
  }

  async registerUser(data: {
    email: string;
    password: string;
    User_Name: string;
    phone_no: number;
  }) {
    // console.log(data)
    try {
      logger.info("src->services->auth.service->registerUser");


      const hashedPassword = await bcrypt.hash(data.password, 10);
// console.log(hashedPassword)
      const createdUser = await this.Userdao.createUser({
        ...data,
        password: hashedPassword,
        otp:""
      });
// console.log(createdUser)
      return createdUser;
    } catch (error: any) {
      logger.error(
        "unable to register user in src->services->auth.service->registerUser"
      );
      logger.debug(error);
      throw new Error(error.message || "Registration failed");
    }
  }

  async loginUser(data: { email: string; password: string }) {
    try {
      logger.info("src->services->auth.service->loginUser");

      const user = await this.Userdao.findByEmail(data.email);
      if (!user) {
        throw new Error("Invalid email or password");
      }
       if (!user.isVerified) {
        const deleteUser= await this.Userdao.DeleteUser(data.email)
        throw new Error("User Not found");
      }

     

      const isMatch = await bcrypt.compare(data.password, user.password);
      if (!isMatch) {
        throw new Error("Invalid email or password");
      }

      const payload = {
        id: user._id,
        email: user.email,
        User_Name: user.User_Name,
        role:user.role
      };
const JWT_SECRET = process.env.SECRET_KEY;
if (!JWT_SECRET) {
  throw new Error("SECRET_KEY is not defined in environment variables");
}
      const token = jwt.sign(payload,JWT_SECRET, {
        expiresIn: "20d",
      });

      return { token, user: user };
    } catch (error: any) {
      logger.error(
        "unable to login user in src->services->auth.service->loginUser"
      );
      logger.debug(error);
      throw new Error(error.message || "Login failed");
    }
  }
  async UserEmailVerificationEmailSend(email: string, otp: string) {
    try {
      logger.info("src->services->auth.service->UserEmailVerificationEmailSend");
      const user: any = await this.Userdao.findByEmail(email);
      console.log(user,otp,user.otp)
      if (user?.otp == otp) {
        return await this.Userdao.findByUserEmailAndUpdate(email);
      }
await this.Userdao.DeleteUser(email);
      throw new Error( "Verification failed");

    } catch (error: any) {
      logger.error(
        "unable to verify user in src->services->auth.service->UserEmailVerificationEmailSend"
      );
      logger.debug(error);
      throw new Error(error.message || "Registration failed");
    }
  }
   async UserResetEmailVerificationEmailSend(email: string, otp: string) {
    try {
      logger.info("src->services->auth.service->UserResetEmailVerificationEmailSend");
      const user: any = await this.Authdao.findResetPasswordByEmail(email);
      console.log(user,otp,user.otp)
      if (user?.otp == otp) {
        return await this.Authdao.VerifyResetEmail(email);
      }
      throw new Error( "Verification failed");

    } catch (error: any) {
      logger.error(
        "unable to verify user in src->services->auth.service->UserEmailVerificationEmailSend"
      );
      logger.debug(error);
      throw new Error(error.message || "Verification failed");
    }
  }
   async UserPassUpdate(data: {
    email: string;
    password: string;
   
  }) {
    // console.log(data)
    try {
      logger.info("src->services->auth.service->UserPassUpdate");


      const hashedPassword = await bcrypt.hash(data.password, 10);
// console.log(hashedPassword)
      const UpdatedUser = await this.Authdao.updatePassword(data.email, hashedPassword);
// console.log(createdUser)
      return UpdatedUser;
    } catch (error: any) {
      logger.error(
        "unable to reset password in src->services->auth.service->UserPassUpdate",
 "user in src->services->auth.service->registerUser"
      );
      logger.debug(error);
      throw new Error(error.message || "Password reset failed");
    }
  }
}
