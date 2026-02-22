import { Types } from "mongoose";
import { sendAppointmentStatusEmail } from "../common/services/AppointmentStatus.email.js";
import AppointmentDao from "../dao/Appointment.dao.js";
import { LeadsDao } from "../dao/Leads.dao.js";
import NotificationDao from "../dao/Notification.dao.js";
import UserDao from "../dao/User.dao.js";
import { logger } from "../utils/logger.js";

function isValidStatus(status: any): boolean {
  return ["Pending", "Confirmed", "Cancelled", "Completed", "Convert to lead"].includes(status);
}

export default class AppointmentServices {
  private appointmentDao: AppointmentDao;
  private notificationDao: NotificationDao;
  private leadDao?: LeadsDao;
  private userDao?: UserDao;
  constructor() {
    this.appointmentDao = new AppointmentDao();
    this.notificationDao = new NotificationDao();
    this.leadDao = new LeadsDao();
    this.userDao = new UserDao();
  }

  async createAppointment(data: {
    user_id: string;
    property_id: string;
    phone?: string;
    status?: string;
    schedule_Time?: Date
  }) {
    try {
      logger.info("AppointmentServices -> createAppointment called", { data });


      const requiredFields = ["user_id", "property_id"];
      for (const field of requiredFields) {
        if (!data[field as keyof typeof data]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }


      if (data.status && !isValidStatus(data.status)) {
        throw new Error(
          `Invalid status. Must be one of: Pending, Confirmed, Cancelled, Completed`
        );
      }

      const appointment = await this.appointmentDao.createAppointment(data);
      if (!appointment) {
        throw new Error("Failed to create appointment");
      }

      await this.notificationDao.createNotification({
        user_id: data.user_id,
        property_id: data.property_id,
        description: "New appointment created",
        adminOnly: true
      });

      // Always create a lead entry for each appointment so admin leads can show all user bookings.
      if (this.userDao && this.leadDao) {
        const user: any = await this.userDao.findByUserId(data.user_id);
        if (user) {
          try {
            const scheduleTimeText = data.schedule_Time
              ? new Date(data.schedule_Time).toISOString()
              : "Not scheduled yet";
            await this.leadDao.createLead({
              searchQuery: `Appointment requested for property ${data.property_id}`,
              contactInfo: {
                name: user?.User_Name,
                phone: String(user?.phone_no || ""),
                email: user?.email,
              },
              matchedProperties: [new Types.ObjectId(data.property_id)],
              status: "inquiry",
              priority: "high",
              source: "appointment",
              notes: `Auto-created from appointment booking. Schedule time: ${scheduleTimeText}`,
            });
          } catch (leadError: any) {
            logger.error("AppointmentServices -> lead creation failed", {
              userId: data.user_id,
              propertyId: data.property_id,
              error: leadError?.message,
            });
          }
        }
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> createAppointment error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to create appointment");
    }
  }

  async getAppointmentById(id: string) {
    try {
      logger.info("AppointmentServices -> getAppointmentById called", { id });
      const appointment = await this.appointmentDao.getAppointmentById(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> getAppointmentById error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get appointment");
    }
  }
  async getAppointmentByUserId(id: string, property_id: string) {
    try {
      logger.info("AppointmentServices -> UserId called", { id });
      const appointment = await this.appointmentDao.getAppointmentByUserId(id, property_id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> getAppointmentByUserId error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get appointment");
    }
  }
  async getAppointmentForUserId(id: string) {
    try {
      logger.info("AppointmentServices -> UserId called", { id });
      const appointment = await this.appointmentDao.getAppointmentForUserId(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> getAppointmentByUserId error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get appointment");
    }
  }

  async getAppointmentByPropertyId(id: string) {
    try {
      logger.info("AppointmentServices -> UserId called", { id });
      const appointment = await this.appointmentDao.getAppointmentByPropertyId(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> getAppointmentByPropertyId error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to get appointment");
    }
  }

  async getAllAppointments(filter = {}) {
    try {
      logger.info("AppointmentServices -> getAllAppointments called", { filter });
      const appointments = await this.appointmentDao.getAllAppointments(filter)
      return appointments;
    } catch (error: any) {
      logger.error("AppointmentServices -> getAllAppointments error", {
        error: error.message,
      });
      throw new Error(error.message || "Failed to get appointments");
    }
  }

  async getTotalAppointments() {
    try {
      logger.info("AppointmentServices -> getTotalAppointments called");
      const count = await this.appointmentDao.countAllAppointments();
      return count;
    } catch (error: any) {
      logger.error("AppointmentServices -> getTotalAppointments error", { error: error.message });
      throw new Error(error.message || "Failed to count appointments");
    }
  }

  async updateAppointment(id: string, data: Partial<{
    user_id: string;
    property_id: string;
    phone?: string;
    status?: string;
  }>) {
    try {
      logger.info("AppointmentServices -> updateAppointment called", { id, data });

      if (data.status && !isValidStatus(data.status)) {
        throw new Error(
          `Invalid status. Must be one of: Pending, Confirmed, Cancelled, Completed`
        );
      }

      const appointment: any = await this.appointmentDao.updateAppointment(id, data);
      // console.log(appointment)
      if (data.status !== "Convert to lead") {
        await sendAppointmentStatusEmail(appointment, appointment?.user_id, appointment?.property_id)
      }

      const user: any = await this.userDao?.findByUserId(appointment?.user_id);
      const leadsCheck = await this.leadDao?.getLeadsByUserEmail(user?.email);
      if (!leadsCheck && appointment?.status === "Convert to lead") {
        await this.leadDao?.createLead({
          contactInfo: {
            name: user?.User_Name,
            phone: user?.phone_no,
            email: user?.email,
          },
          matchedProperties: [appointment?.property_id],
          status: "new",
          priority: "high",
        });
      }

      // console.log("mail sent")
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> updateAppointment error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to update appointment");
    }
  }

  async deleteAppointment(id: string) {
    try {
      logger.info("AppointmentServices -> deleteAppointment called", { id });
      const appointment = await this.appointmentDao.deleteAppointment(id);
      if (!appointment) {
        throw new Error("Appointment not found");
      }
      return appointment;
    } catch (error: any) {
      logger.error("AppointmentServices -> deleteAppointment error", {
        id,
        error: error.message,
      });
      throw new Error(error.message || "Failed to delete appointment");
    }
  }
}
