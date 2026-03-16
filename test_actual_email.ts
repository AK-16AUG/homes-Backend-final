import { sendAdminInquiryNotification } from './src/common/services/resend.js';
import * as dotenv from 'dotenv';

dotenv.config();

async function testCurrentSetup() {
    console.log('Testing CURRENT email setup (Nodemailer/Gmail)...');
    console.log('EMAIL:', process.env.EMAIL);
    console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

    const result = await sendAdminInquiryNotification({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        location: 'Test Location',
        searchQuery: 'Looking for a flat',
    });

    if (result.success) {
        console.log('✅ Success:', result.message);
    } else {
        console.error('❌ Failure:', result.message);
        console.error('Error Details:', result.error);
    }
}

testCurrentSetup();
