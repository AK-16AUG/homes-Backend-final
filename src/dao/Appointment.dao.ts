import { Appointment } from "../entities/appointment.entity.js";
import { logger } from "../utils/logger.js";


export default class AppointmentDao {
  private appointment = Appointment;

  async createAppointment(data: any) {
    logger.info("AppointmentDao -> createAppointment called", { data });
    try {
      const result = await this.appointment.create(data);
      logger.info("AppointmentDao -> createAppointment success", { id: result._id });
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> createAppointment error", { error: error.message });
      throw error;
    }
  }

  async getAppointmentById(id: string) {
    logger.info("AppointmentDao -> getAppointmentById called", { id });
    try {
      const result = await this.appointment
        .findById(id)
        .populate("user_id").select("-password")
        .populate("property_id");
      if (result) {
        logger.info("AppointmentDao -> getAppointmentById success", { id });
      } else {
        logger.warn("AppointmentDao -> getAppointmentById not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> getAppointmentById error", { id, error: error.message });
      throw error;
    }
  }
  async getAppointmentByUserId(id: string, property_id: string) {
    logger.info("AppointmentDao -> getAppointmentByUserId called", { id });
    try {
      const result = await this.appointment
        .find({ user_id: id, property_id })
        .populate("user_id", "-password")
        .populate("property_id");
      if (result) {
        logger.info("AppointmentDao -> getAppointmentByUserId success", { id });
      } else {
        logger.warn("AppointmentDao -> getAppointmentByUserId not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> getAppointmentById error", { id, error: error.message });
      throw error;
    }
  }
  async getAppointmentForUserId(id: string) {
    logger.info("AppointmentDao -> getAppointmentForUserId called", { id });
    try {
      const result = await this.appointment
        .find({ user_id: id })
        .populate("user_id", "-password")
        .populate("property_id");
      if (result) {
        logger.info("AppointmentDao -> getAppointmentForUserId success", { id });
      } else {
        logger.warn("AppointmentDao -> getAppointmentForUserId not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> getAppointmentForUserId error", { id, error: error.message });
      throw error;
    }
  }
  async getAppointmentByPropertyId(id: string) {
    logger.info("AppointmentDao -> getAppointmentByPropertyId", { id });
    try {
      const result = await this.appointment
        .find({ property_id: id })
        .populate("user_id", "-password")
      if (result) {
        logger.info("AppointmentDao -> getAppointmentByPropertyId success", { id });
      } else {
        logger.warn("AppointmentDao -> getAppointmentByPropertyId not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> getAppointmentByPropertyId error", { id, error: error.message });
      throw error;
    }
  }
  async getAllAppointments({ page = 1, limit = 10, search = "" }) {
    logger.info("AppointmentDao -> getAllAppointments called", { page, limit, search });

    try {
      const pageNum = Number(page);
      const limitNum = Number(limit);
      const skip = (pageNum - 1) * limitNum;


      const filter: any = {};

      if (search) {
        // Since we can't filter by populated fields directly in Mongoose .find(),
        // we first find relevant user IDs
        const User = (await import("../entities/User.entitiy.js")).default;
        const matchingUsers = await User.find({
          $or: [
            { 'User_Name': { $regex: search, $options: "i" } },
            { 'email': { $regex: search, $options: "i" } }
          ]
        }).select('_id');

        const userIds = matchingUsers.map(u => u._id);
        filter.user_id = { $in: userIds };
      }

      const [result, total] = await Promise.all([
        this.appointment
          .find(filter)
          .populate("user_id", "-password")
          .populate("property_id")
          .skip(skip)
          .limit(limitNum).sort({ createdAt: -1 })
          .lean(),
        this.appointment.countDocuments(filter)
      ]);

      logger.info("AppointmentDao -> getAllAppointments success", { count: result.length });

      return {
        data: result,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total
      };
    } catch (error: any) {
      logger.error("AppointmentDao -> getAllAppointments error", { error: error.message });
      throw error;
    }
  }

  async countAllAppointments() {
    logger.info("AppointmentDao -> countAllAppointments called");
    try {
      const count = await this.appointment.countDocuments();
      logger.info("AppointmentDao -> countAllAppointments success", { count });
      return count;
    } catch (error: any) {
      logger.error("AppointmentDao -> countAllAppointments error", { error: error.message });
      throw error;
    }
  }

  async updateAppointment(id: string, data: any) {
    logger.info("AppointmentDao -> updateAppointment called", { id, data });
    try {
      const result = await this.appointment
        .findByIdAndUpdate(id, data, { new: true })
        .populate("user_id", "-password")
        .populate("property_id");
      if (result) {
        logger.info("AppointmentDao -> updateAppointment success", { id });
      } else {
        logger.warn("AppointmentDao -> updateAppointment not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> updateAppointment error", { id, error: error.message });
      throw error;
    }
  }

  async deleteAppointment(id: string) {
    logger.info("AppointmentDao -> deleteAppointment called", { id });
    try {
      const result = await this.appointment.findByIdAndDelete(id);
      if (result) {
        logger.info("AppointmentDao -> deleteAppointment success", { id });
      } else {
        logger.warn("AppointmentDao -> deleteAppointment not found", { id });
      }
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> deleteAppointment error", { id, error: error.message });
      throw error;
    }
  }

  async deleteAllAppointmentsByPropertyId(propertyId: string) {
    logger.info("AppointmentDao -> deleteAllAppointmentsByPropertyId called", { propertyId });
    try {
      const result = await this.appointment.deleteMany({ property_id: propertyId });
      logger.info("AppointmentDao -> deleteAllAppointmentsByPropertyId success", { propertyId, deletedCount: result.deletedCount });
      return result;
    } catch (error: any) {
      logger.error("AppointmentDao -> deleteAllAppointmentsByPropertyId error", { propertyId, error: error.message });
      throw error;
    }
  }
}
