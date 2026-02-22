import { sendAdminNotificationEmail } from './src/common/services/email.js';
import dotenv from 'dotenv';
dotenv.config();

async function testResend() {
    console.log("Starting Resend test...");
    const result = await sendAdminNotificationEmail(
        "keshavbruh@gmail.com",
        "Test from Antigravity",
        "This is a test to verify Resend.com integration."
    );
    console.log("Result:", result);
    process.exit(result.success ? 0 : 1);
}

testResend();
