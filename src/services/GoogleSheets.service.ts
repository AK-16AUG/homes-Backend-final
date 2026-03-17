import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { logger } from '../utils/logger.js';

dotenv.config();

export class GoogleSheetsService {
    private doc: GoogleSpreadsheet | null = null;
    private sheetID: string;
    private clientEmail: string;
    private privateKey: string;
    private loadingPromise: Promise<GoogleSpreadsheet | null> | null = null;

    constructor() {
        this.sheetID = process.env.GOOGLE_SHEET_ID || "";
        this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";

        // Handle private key with escaped newlines and potential wrapping quotes
        let rawKey = process.env.GOOGLE_PRIVATE_KEY || "";

        // Clean up key: remove literal quotes and handle escaped/real newlines
        rawKey = rawKey.trim();
        if (rawKey.startsWith('"') && rawKey.endsWith('"')) {
            rawKey = rawKey.slice(1, -1);
        }
        if (rawKey.startsWith("'") && rawKey.endsWith("'")) {
            rawKey = rawKey.slice(1, -1);
        }

        // Convert literal \n strings to real newlines, and handle escaped versions
        this.privateKey = rawKey
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\r/g, ''); // Remove carriage returns if any

        if (!this.privateKey) {
            logger.warn("GOOGLE_PRIVATE_KEY is empty in environment variables.");
        } else if (!this.privateKey.includes("BEGIN PRIVATE KEY")) {
            logger.warn("GOOGLE_PRIVATE_KEY does not seem to contain a valid header.");
            // Log a safe preview for debugging (first 15 chars)
            logger.debug(`Key start: ${rawKey.substring(0, 15)}...`);
        }
    }

    public async getDoc() {
        if (this.doc) return this.doc;
        if (this.loadingPromise) return this.loadingPromise;

        this.loadingPromise = (async () => {
            if (!this.sheetID || !this.clientEmail || !this.privateKey) {
                logger.warn("Google Sheets credentials not fully configured.");
                return null;
            }

            try {
                const serviceAccountAuth = new JWT({
                    email: this.clientEmail,
                    key: this.privateKey,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });

                const doc = new GoogleSpreadsheet(this.sheetID, serviceAccountAuth);
                logger.info(`Google Sheets Sync: Attempting to load doc ${this.sheetID}...`);
                await doc.loadInfo();
                logger.info(`Google Sheets Sync: Successfully loaded doc "${doc.title}"`);
                this.doc = doc;
                return this.doc;
            } catch (error: any) {
                logger.error("Google Sheets Sync: Error connecting to Google Sheets:", error.message);
                if (error.stack) logger.debug(error.stack);
                return null;
            } finally {
                this.loadingPromise = null;
            }
        })();

        return this.loadingPromise;
    }

    async appendLead(leadData: any) {
        try {
            const doc = await this.getDoc();
            if (!doc) return;

            const sheet = doc.sheetsByIndex[0];
            const headers = ['Date', 'Name', 'Email', 'Phone', 'Query', 'Source', 'Status'];

            try {
                await sheet.loadHeaderRow();
            } catch (e) {
                // If sheet is empty, set headers
                await sheet.setHeaderRow(headers);
            }

            const row = {
                Date: leadData.createdAt ? new Date(leadData.createdAt).toLocaleString() : new Date().toLocaleString(),
                Name: leadData.contactInfo?.name || "N/A",
                Email: leadData.contactInfo?.email || "N/A",
                Phone: leadData.contactInfo?.phone || "N/A",
                Query: leadData.searchQuery || "N/A",
                Source: leadData.source || "Web Inquiry",
                Status: leadData.status || "new",
            };

            await sheet.addRow(row);
            logger.info("Lead synced to Google Sheets successfully.");
        } catch (error) {
            logger.error("Error appending lead to Google Sheets:", error);
        }
    }

    async syncAllLeads(leads: any[]) {
        try {
            const doc = await this.getDoc();
            if (!doc) return;

            const sheet = doc.sheetsByIndex[0];
            const headers = ['Date', 'Name', 'Email', 'Phone', 'Query', 'Source', 'Status'];

            // Clear the sheet completely and start fresh with headers
            await sheet.clear();
            await sheet.setHeaderRow(headers);

            const rows = leads.map(lead => ({
                Date: lead.createdAt ? new Date(lead.createdAt).toLocaleString() : new Date().toLocaleString(),
                Name: lead.contactInfo?.name || "N/A",
                Email: lead.contactInfo?.email || "N/A",
                Phone: lead.contactInfo?.phone || "N/A",
                Query: lead.searchQuery || "N/A",
                Source: lead.source || "Web Inquiry",
                Status: lead.status || "new",
            }));

            if (rows.length > 0) {
                await sheet.addRows(rows);
            }
            logger.info(`Synced ${rows.length} leads to Google Sheets.`);
        } catch (error) {
            logger.error("Error syncing all leads to Google Sheets:", error);
        }
    }
}

export const googleSheetsService = new GoogleSheetsService();
