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
        this.sheetID = process.env.GOOGLE_SHEET_ID || "1Ngf_p1FkZaak_XNfRd9R5WyhkTPIwyD32sKImAq1LRo";
        this.clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "lead-sync@motherhomes.iam.gserviceaccount.com";

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

        // Convert literal \n strings to real newlines
        let key = rawKey.replace(/\\n/g, '\n');

        // IF the key has NO newlines but HAS the header, it's likely collapsed (common Vercel issue)
        if (!key.includes('\n') && key.includes('-----BEGIN PRIVATE KEY-----')) {
            const header = '-----BEGIN PRIVATE KEY-----';
            const footer = '-----END PRIVATE KEY-----';
            let body = key.replace(header, '').replace(footer, '').replace(/\s/g, '');
            
            // Reconstruct with 64-char lines
            let formattedBody = '';
            for (let i = 0; i < body.length; i += 64) {
                formattedBody += body.substring(i, i + 64) + '\n';
            }
            key = `${header}\n${formattedBody}${footer}\n`;
        }

        this.privateKey = key;

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

    async readLeads() {
        try {
            const doc = await this.getDoc();
            if (!doc) return [];

            const sheet = doc.sheetsByIndex[0];
            const rows = await sheet.getRows();

            return rows.map(row => ({
                Date: row.get('Date'),
                Name: row.get('Name'),
                Email: row.get('Email'),
                Phone: row.get('Phone'),
                Query: row.get('Query'),
                Source: row.get('Source'),
                Status: row.get('Status'),
            }));
        } catch (error) {
            logger.error("Error reading leads from Google Sheets:", error);
            return [];
        }
    }
}

export const googleSheetsService = new GoogleSheetsService();
