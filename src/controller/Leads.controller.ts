import { Request, Response } from "express";
import LeadsService from "../services/Leads.service.js";
import { ExcelGenerator } from "../utils/ExcelGenerator.js";
import { leadExportService } from "../services/LeadExport.service.js";
import { googleSheetsService } from "../services/GoogleSheets.service.js";
import * as fs from "fs";
import statusCode from "../common/constant/StatusCode.js";
import errorResponse from "../common/constant/Error.js";

const leadsService = new LeadsService();

export default class LeadsController {
  async createLead(req: Request, res: Response) {
    try {
      const lead = await leadsService.createLead(req.body);
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

  async exportLeads(req: Request, res: Response) {
    try {
      const filePath = ExcelGenerator.getFilePath();
      console.log(`[EXPORT] Request received. Target path: ${filePath}`);

      // If file doesn't exist, sync it now
      if (!fs.existsSync(filePath)) {
        console.log("[EXPORT] File missing. Triggering syncFullExcel...");
        await leadExportService.syncFullExcel();
      }

      if (!fs.existsSync(filePath)) {
        console.error("[EXPORT] ERROR: File still missing after sync attempt.");
        return res.status(statusCode.NOT_FOUND).json({
          message: "Lead sheet not found and could not be generated"
        });
      }

      console.log("[EXPORT] SUCCESS: Sending file for download.");
      return res.download(filePath, "leads.xlsx");
    } catch (error: any) {
      console.error("[EXPORT] EXCEPTION:", error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async syncSheets(req: Request, res: Response) {
    try {
      console.log("[EXPORT] Full sync requested for both Excel and Google Sheets.");
      const leads = await leadsService.getAllLeads({}, 1, 10000);

      // Sync Google Sheets
      await googleSheetsService.syncAllLeads(leads.results);

      // Also sync local Excel file
      await leadExportService.syncFullExcel();

      return res.status(statusCode.OK).json({
        message: "All spreadsheets synced successfully"
      });
    } catch (error: any) {
      console.error("[EXPORT] Sync Error:", error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: errorResponse.INTERNAL_SERVER_ERROR,
        message: error.message,
      });
    }
  }

  async testSheets(req: Request, res: Response) {
    try {
      console.log("[DIAGNOSTIC] Testing Google Sheets connection...");
      
      // Get config for debug
      const sheetID = process.env.GOOGLE_SHEET_ID;
      const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
      const rawKey = process.env.GOOGLE_PRIVATE_KEY || "";
      
      const doc = await googleSheetsService.getDoc();
      if (!doc) {
        return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
          status: "Error",
          message: "Could not authenticate with Google Sheets.",
          debug: {
            sheetID: sheetID ? "Configured" : "MISSING",
            clientEmail: clientEmail ? "Configured" : "MISSING",
            keyLength: rawKey.length,
            keyStart: rawKey.substring(0, 25) + "...",
            keyEnd: "..." + rawKey.substring(rawKey.length - 25)
          }
        });
      }

      return res.status(statusCode.OK).json({
        status: "Success",
        message: "Google Sheets connection established!",
        sheetTitle: doc.title,
        sheets: doc.sheetsByIndex.map(s => s.title)
      });
    } catch (error: any) {
      console.error("[DIAGNOSTIC] Error:", error);
      return res.status(statusCode.INTERNAL_SERVER_ERROR).json({
        error: error.message
      });
    }
  }
}
