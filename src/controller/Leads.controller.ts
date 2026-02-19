import { Request, Response } from "express";
import LeadsService from "../services/Leads.service.js";
import NotificationService from "../services/Notification.service.js";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const leadsService = new LeadsService();
const notificationService = new NotificationService();

export default class LeadsController {
  async createLead(req: Request, res: Response) {
    try {
      const lead = await leadsService.createLead(req.body);

      // Fire-and-forget: create notification + send admin email
      if (lead?.user_id && lead?.property_id) {
        notificationService.createLeadNotification({
          user_id: String(lead.user_id),
          property_id: String(lead.property_id),
          leadDetails: `Lead for property ${lead.property_id} by user ${lead.user_id}`,
        }).catch((err) => console.error("Lead notification error:", err));
      }

      return res.status(statusCode.CREATED).json({
        message: "Lead created successfully",
        lead
      });
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async updateLead(req: Request, res: Response) {
    try {
      const lead = await leadsService.updateLeadById(req.params.id, req.body);
      return res.status(statusCode.OK).json({
        message: "Lead updated successfully",
        lead
      });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.LEAD_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getLeadById(req: Request, res: Response) {
    try {
      const lead = await leadsService.getLeadById(req.params.id);
      return res.status(statusCode.OK).json(lead);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.LEAD_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getAllLeads(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, ...filter } = req.query;
      const pageNum = Number(page) || 1;
      const limitNum = Number(limit) || 10;
      const leads = await leadsService.getAllLeads(filter, pageNum, limitNum);
      return res.status(statusCode.OK).json(leads);
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async deleteLead(req: Request, res: Response) {
    try {
      const lead = await leadsService.deleteLeadById(req.params.id);
      return res.status(statusCode.OK).json({
        message: "Lead deleted successfully",
        lead
      });
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.LEAD_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getLeadsByStatus(req: Request, res: Response) {
    try {
      const { status } = req.params;
      const leads = await leadsService.getLeadsByStatus(status);
      return res.status(statusCode.OK).json(leads);
    } catch (error: any) {
      return res.status(statusCode.BAD_REQUEST).json({
        error: errorResponse.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async getLeadsByUser(req: Request, res: Response) {
    try {
      const leads = await leadsService.getLeadsByUser(req.params.userId);
      return res.status(statusCode.OK).json(leads);
    } catch (error: any) {
      return res.status(statusCode.NOT_FOUND).json({
        error: errorResponse.LEAD_NOT_FOUND,
        message: error.message,
      });
    }
  }

  async getTotalLeads(req: Request, res: Response) {
    try {
      const count = await leadsService.getTotalLeads();
      return res.status(statusCode.OK).json({ totalLeads: count });
    } catch (error: any) {
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }
}