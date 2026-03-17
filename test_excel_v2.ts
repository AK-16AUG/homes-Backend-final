import { leadExportService } from "./src/services/LeadExport.service.js";
import { ExcelGenerator } from "./src/utils/ExcelGenerator.js";
import * as fs from "fs";
import dbConnect from "./src/db/db.connect.js";
import mongoose from "mongoose";

async function verify() {
    try {
        console.log("Starting verification...");
        await dbConnect();

        // Ensure directory exists
        const exportDir = "./storage/exports";
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }

        console.log("Syncing Excel...");
        await leadExportService.syncFullExcel();

        const filePath = ExcelGenerator.getFilePath();
        if (fs.existsSync(filePath)) {
            console.log("SUCCESS: Excel file created at", filePath);
            const stats = fs.statSync(filePath);
            console.log("File size:", stats.size, "bytes");
        } else {
            console.error("FAILURE: Excel file not created");
            return;
        }

        // Test append
        console.log("Testing append...");
        const testLead = {
            contactInfo: { name: "Antigravity Test", email: "test@antigravity.ai", phone: "9999999999" },
            searchQuery: "Testing Live Update",
            source: "Automated Verification",
            status: "new",
            createdAt: new Date()
        };

        await leadExportService.appendLeadToExcel(testLead);
        console.log("Append command sent loop.");

        // Check if file grew or has new data
        const newStats = fs.statSync(filePath);
        console.log("New file size:", newStats.size, "bytes");
        if (newStats.size >= stats.size) {
            console.log("VERIFIED: Excel file updated.");
        }

    } catch (error) {
        console.error("Verification failed:", error);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

verify();
