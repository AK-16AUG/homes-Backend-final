import * as xlsx from "xlsx";
import * as fs from "fs";
import * as path from "path";
import { logger } from "./logger.js";

const STORAGE_PATH = path.resolve("storage/exports/leads.xlsx");

export interface LeadRow {
    Date: string;
    Name: string;
    Email: string;
    Phone: string;
    Query: string;
    Source: string;
    Status: string;
}

export class ExcelGenerator {
    static async appendLead(lead: LeadRow) {
        try {
            let workbook;
            let worksheet;
            const headers = ["Date", "Name", "Email", "Phone", "Query", "Source", "Status"];

            if (fs.existsSync(STORAGE_PATH)) {
                workbook = xlsx.readFile(STORAGE_PATH);
                const sheetName = workbook.SheetNames[0];
                worksheet = workbook.Sheets[sheetName];

                // Append data
                const data = xlsx.utils.sheet_to_json(worksheet);
                data.push(lead);

                // Create new worksheet from combined data to maintain structure
                const newWorksheet = xlsx.utils.json_to_sheet(data, { header: headers });
                workbook.Sheets[sheetName] = newWorksheet;
            } else {
                workbook = xlsx.utils.book_new();
                worksheet = xlsx.utils.json_to_sheet([lead], { header: headers });
                xlsx.utils.book_append_sheet(workbook, worksheet, "Leads");
            }

            xlsx.writeFile(workbook, STORAGE_PATH);
            logger.info(`Lead appended to Excel: ${STORAGE_PATH}`);
        } catch (error) {
            logger.error("Error appending lead to Excel:", error);
            throw error;
        }
    }

    static async syncExistingLeads(leads: LeadRow[]) {
        try {
            const workbook = xlsx.utils.book_new();
            const headers = ["Date", "Name", "Email", "Phone", "Query", "Source", "Status"];
            const worksheet = xlsx.utils.json_to_sheet(leads, { header: headers });
            xlsx.utils.book_append_sheet(workbook, worksheet, "Leads");

            xlsx.writeFile(workbook, STORAGE_PATH);
            logger.info(`Excel synced with ${leads.length} leads: ${STORAGE_PATH}`);
        } catch (error) {
            logger.error("Error syncing leads to Excel:", error);
            throw error;
        }
    }

    static getFilePath() {
        return STORAGE_PATH;
    }
}
