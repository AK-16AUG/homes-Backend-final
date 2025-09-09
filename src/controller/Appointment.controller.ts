import { Request, Response } from "express";
import AppointmentServices from "../services/Appointment.services.js";
import { logger } from "../utils/logger.js";

export default class AppointmentController {
  private appointmentServices: AppointmentServices;

  constructor() {
    
    this.appointmentServices = new AppointmentServices();
  }

  createAppointment = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->createAppointment");
      const { user_id, property_id, phone, status,schedule_Time } = req.body;

      if (!user_id || !property_id) {
        return res.status(400).json({ message: "user_id and property_id are required" });
      }

      const createdAppointment = await this.appointmentServices.createAppointment({
        user_id,
        property_id,
        phone,
        status,
        schedule_Time
      });

      return res.status(201).json({ message: "Appointment created successfully", appointment: createdAppointment });
    } catch (error: any) {
      logger.error("Error in createAppointment:", error);
      return res.status(500).json({ message: error.message || "Failed to create appointment" });
    }
  };

  getAppointmentById = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->getAppointmentById");
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const appointment = await this.appointmentServices.getAppointmentById(id);

      return res.status(200).json({ message: "Appointment fetched successfully", appointment });
    } catch (error: any) {
      logger.error("Error in getAppointmentById:", error);
      return res.status(404).json({ message: error.message || "Appointment not found" });
    }
  };
getAppointmentByUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->getAppointmentByUserId");
      const { userid,propertyid } = req.params;

      if (!userid) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const appointment = await this.appointmentServices.getAppointmentByUserId(userid,propertyid);

      return res.status(200).json({ message: "Appointment fetched successfully", appointment });
    } catch (error: any) {
      logger.error("Error in getAppointmentByUserId:", error);
      return res.status(404).json({ message: error.message || "Appointment not found" });
    }
  };
  getAppointmentForUserId = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->getAppointmentForUserId");
      const { userid } = req.params;

      if (!userid) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const appointment = await this.appointmentServices.getAppointmentForUserId(userid);

      return res.status(200).json({ message: "Appointment fetched successfully", appointment });
    } catch (error: any) {
      logger.error("Error in getAppointmentForUserId:", error);
      return res.status(404).json({ message: error.message || "Appointment not found" });
    }
  };
getAppointmentByPropertyId = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->getAppointmentByPropertyId");
      const { propertyid } = req.params;

      if (!propertyid) {
        return res.status(400).json({ message: "propertyid is required" });
      }

      const appointment = await this.appointmentServices.getAppointmentByPropertyId(propertyid);

      return res.status(200).json({ message: "Appointment fetched successfully", appointment });
    } catch (error: any) {
      logger.error("Error in getAppointmentByPropertyId:", error);
      return res.status(404).json({ message: error.message || "Appointment not found" });
    }
  };
  getAllAppointments = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->getAllAppointments");
      const filter = req.query || {};

      const appointments = await this.appointmentServices.getAllAppointments(filter);

      return res.status(200).json({ message: "Appointments fetched successfully", appointments });
    } catch (error: any) {
      logger.error("Error in getAllAppointments:", error);
      return res.status(500).json({ message: error.message || "Failed to fetch appointments" });
    }
  };

  updateAppointment = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->updateAppointment");
      const { id } = req.params;
      const data = req.body;

      if (!id) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const updatedAppointment = await this.appointmentServices.updateAppointment(id, data);

      return res.status(200).json({ message: "Appointment updated successfully", appointment: updatedAppointment });
    } catch (error: any) {
      logger.error("Error in updateAppointment:", error);
      return res.status(404).json({ message: error.message || "Failed to update appointment" });
      
    }
  };

  deleteAppointment = async (req: Request, res: Response): Promise<Response> => {
    try {
      logger.info("src->controllers->appointment.controller->deleteAppointment");
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Appointment ID is required" });
      }

      const deletedAppointment = await this.appointmentServices.deleteAppointment(id);

      return res.status(200).json({ message: "Appointment deleted successfully", appointment: deletedAppointment });
    } catch (error: any) {
      logger.error("Error in deleteAppointment:", error);
      return res.status(404).json({ message: error.message || "Failed to delete appointment" });
    }
  };

  getTotalAppointments = async (req: Request, res: Response): Promise<Response> => {
    try {
      const count = await this.appointmentServices.getTotalAppointments();
      return res.status(200).json({ totalAppointments: count });
    } catch (error: any) {
      return res.status(500).json({ message: error.message || "Failed to count appointments" });
    }
  };

  async createLeadFromAppointmentUpdate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      const appointmentServices = this.appointmentServices;
      const appointment = await appointmentServices.updateAppointment(id, data);
      // The updateAppointment method already creates a lead if needed
      return res.status(200).json({
        message: "Appointment updated and lead created (if not exists)",
        appointment
      });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Failed to update appointment and create lead"
      });
    }
  }
}
