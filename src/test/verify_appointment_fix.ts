import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2E4MGYwNmI0NGIzMjQ5OTk0YTBjOCIsImVtYWlsIjoiYXl1c2hjaGF1aGFuMDUwOEBnbWFpbC5jb20iLCJVc2VyX05hbWUiOiJBYXl1c2ggY2hhdWhhbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzA0MTY4NiwiZXhwIjoxNzU0NzY5Njg2fQ.QbXoDcb8sXvNWQdnEEFkXGgrcHtVDMdCwVV3qCp8j8I';

async function verifyFix() {
    console.log('Testing Appointment Fetch Fix...');

    try {
        // 1. Test basic fetch
        console.log('\n--- 1. Testing basic fetch ---');
        const resAll = await axios.get(`${BASE_URL}/appointments`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('Status:', resAll.status);
        console.log('Message:', resAll.data.message);
        const count = resAll.data.appointments?.data?.length || resAll.data.appointments?.length || 0;
        console.log(`Fetched ${count} appointments.`);

        // 2. Test search with random string (should return empty but not fail)
        console.log('\n--- 2. Testing search with no results ---');
        const resSearchEmpty = await axios.get(`${BASE_URL}/appointments?search=nonexistentuser123`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('Status (Search):', resSearchEmpty.status);
        const searchCount = resSearchEmpty.data.appointments?.data?.length || 0;
        console.log(`Found ${searchCount} appointments for 'nonexistentuser123'.`);

        // 3. Test search with 'Aayush' (from the token name if possible)
        console.log('\n--- 3. Testing search with potential results ---');
        const resSearchAayush = await axios.get(`${BASE_URL}/appointments?search=Aayush`, {
            headers: { Authorization: `Bearer ${TOKEN}` }
        });
        console.log('Status (Search Aayush):', resSearchAayush.status);
        const aayushCount = resSearchAayush.data.appointments?.data?.length || 0;
        console.log(`Found ${aayushCount} appointments for 'Aayush'.`);

        console.log('\nVerification complete!');
    } catch (err: any) {
        if (err.code === 'ECONNREFUSED') {
            console.error('\nERROR: Backend server is not running on localhost:3000.');
            console.log('Please start the backend with "npm run dev" in homes-Backend-final directory.');
        } else {
            console.error('\nVerification FAILED:');
            console.error(err.response?.data || err.message);
        }
    }
}

verifyFix();
