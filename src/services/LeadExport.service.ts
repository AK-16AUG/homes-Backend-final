import { LeadsDao } from "../dao/Leads.dao.js";
import { ExcelGenerator, LeadRow } from "../utils/ExcelGenerator.js";
import { logger } from "../utils/logger.js";

export class LeadExportService {
    private leadsDao: LeadsDao;

    constructor() {
        this.leadsDao = new LeadsDao();
    }

    async appendLeadToExcel(leadData: any) {
        try {
            const row = this.mapLeadToRow(leadData);
            await ExcelGenerator.appendLead(row);
        } catch (error) {
            logger.error("Error in LeadExportService.appendLeadToExcel:", error);
        }
    }

    async syncFullExcel() {
        try {
            const leads = await this.leadsDao.getAllLeads({}, 1, 10000); // Fetch a large batch for sync
            const rows = leads.leads.map(this.mapLeadToRow);
            await ExcelGenerator.syncExistingLeads(rows);
        } catch (error) {
            logger.error("Error in LeadExportService.syncFullExcel:", error);
        }
    }

    private mapLeadToRow(lead: any): LeadRow {
        return {
            Date: lead.createdAt ? new Date(lead.createdAt).toLocaleString() : new Date().toLocaleString(),
            Name: lead.contactInfo?.name || "N/A",
            Email: lead.contactInfo?.email || "N/A",
            Phone: lead.contactInfo?.phone || "N/A",
            Query: lead.searchQuery || "N/A",
            Source: lead.source || "Web Inquiry",
            Status: lead.status || "new",
        };
    }
}

export const leadExportService = new LeadExportService();
