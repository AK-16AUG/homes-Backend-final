import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { googleSheetsService } from '../src/services/GoogleSheets.service.js';
import LeadsDao from '../src/dao/Leads.dao.js';

dotenv.config();

async function runSync() {
    console.log("Connecting to Database...");
    try {
        await mongoose.connect(process.env.URI || "");
        console.log("Database connected.");

        const leadsDao = new LeadsDao();
        console.log("Fetching all leads...");
        const leads = await leadsDao.getAllLeads({}, 1, 10000);

        console.log(`Found ${leads.results?.length || 0} leads. Starting Google Sheets sync...`);

        if (leads.results && leads.results.length > 0) {
            await googleSheetsService.syncAllLeads(leads.results);
            console.log("Sync completed successfully!");
        } else {
            console.log("No leads found to sync.");
        }

    } catch (error) {
        console.error("Sync failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

runSync();
