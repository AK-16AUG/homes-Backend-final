import { Resend } from 'resend';
import * as dotenv from 'dotenv';

dotenv.config();

const apiKey = 're_5vWjKR1T_B6Q5yWapkrbSAbsPpf5qoPHj';
const resend = new Resend(apiKey);

async function testResend() {
    const target = 'keshavbruh@gmail.com';
    console.log(`Testing Resend with key re_5v... to ${target}`);
    try {
        const { data, error } = await resend.emails.send({
            from: 'Test <onboarding@resend.dev>',
            to: [target],
            subject: 'Resend Test for Keshav',
            html: '<p>Testing delivery to keshavbruh@gmail.com</p>',
        });

        if (error) {
            console.error('❌ Resend Error:', error);
        } else {
            console.log('✅ Success! ID:', data?.id);
        }
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testResend();
