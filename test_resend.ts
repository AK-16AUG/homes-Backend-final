import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.RESEND_API_KEY;
console.log('Using API Key:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 5) + '...)' : 'NOT FOUND');

if (!apiKey) {
    console.error('Error: RESEND_API_KEY not found in .env file');
    process.exit(1);
}

const resend = new Resend(apiKey);

async function testResend() {
    console.log('Attempting to send test email...');
    try {
        const { data, error } = await resend.emails.send({
            from: 'Test <onboarding@resend.dev>',
            to: ['admin@motherhomes.co.in'], // Default admin mail from code
            subject: 'Resend Integration Test',
            html: '<p>If you see this, the Resend integration is working correctly from the backend!</p>',
        });

        if (error) {
            console.error('Resend returned an error:', error);
        } else {
            console.log('Success! Email sent. ID:', data?.id);
        }
    } catch (err) {
        console.error('Unexpected error during test:', err);
    }
}

testResend();
