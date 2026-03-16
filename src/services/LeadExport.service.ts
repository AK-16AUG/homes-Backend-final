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
            console.log(`[EXPORT_SERVICE] Appending lead: ${leadData.contactInfo?.name || "unnamed"}`);
            const row = this.mapLeadToRow(leadData);
            await ExcelGenerator.appendLead(row);
            console.log("[EXPORT_SERVICE] Append successful.");
        } catch (error) {
            console.error("[EXPORT_SERVICE] Error in appendLeadToExcel:", error);
        }
    }

    async syncFullExcel() {
        try {
            console.log("[EXPORT_SERVICE] Starting full Excel sync...");
            const leads = await this.leadsDao.getAllLeads({}, 1, 10000);
            console.log(`[EXPORT_SERVICE] Fetched ${leads.results?.length || 0} leads for sync.`);

            if (!leads.results || leads.results.length === 0) {
                console.warn("[EXPORT_SERVICE] No leads found to sync.");
            }

            const rows = leads.results.map((l: any) => this.mapLeadToRow(l));
            await ExcelGenerator.syncExistingLeads(rows);
            console.log("[EXPORT_SERVICE] Full sync successful.");
        } catch (error) {
            console.error("[EXPORT_SERVICE] Error in syncFullExcel:", error);
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
