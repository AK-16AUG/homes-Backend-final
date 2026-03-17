import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { googleSheetsService } from './dist/services/GoogleSheets.service.js';
import { LeadsDao } from './dist/dao/Leads.dao.js';
// Register models to avoid populate errors
import './dist/entities/Leads.js';
import './dist/entities/Properties.entity.js';
import './dist/entities/User.entitiy.js';

dotenv.config();

async function runSync() {
    console.log("Connecting to Database...");
    try {
        await mongoose.connect(process.env.URI || "");
        console.log("Database connected.");

        const leadsDao = new LeadsDao();
        console.log("Fetching all leads from database...");
        const leads = await leadsDao.getAllLeads({}, 1, 10000);

        const results = leads.results || [];
        console.log(`Found ${results.length} leads. Starting Google Sheets sync...`);

        if (results.length > 0) {
            await googleSheetsService.syncAllLeads(results);
            console.log("SUCCESS: Initial sync completed successfully!");
        } else {
            console.log("No leads found to sync.");
        }

    } catch (error) {
        console.error("CRITICAL: Sync failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Database connection closed.");
        process.exit(0);
    }
}

runSync();
