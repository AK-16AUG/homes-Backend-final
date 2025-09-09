import autocannon from 'autocannon';
import { writeFileSync } from 'fs';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4N2E4MGYwNmI0NGIzMjQ5OTk0YTBjOCIsImVtYWlsIjoiYXl1c2hjaGF1aGFuMDUwOEBnbWFpbC5jb20iLCJVc2VyX05hbWUiOiJBYXl1c2ggY2hhdWhhbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1MzA0MTY4NiwiZXhwIjoxNzU0NzY5Njg2fQ.QbXoDcb8sXvNWQdnEEFkXGgrcHtVDMdCwVV3qCp8j8I';
const baseUrl = 'http://localhost:3000';

// Dummy IDs for update/delete/get by id endpoints (replace with real ones if needed)
const userId = '687a80f06b44b3249994a0c8';
const propertyId = '687a82dee8927507202102f3';
const appointmentId = '687b517fbcf61a8335d6b732';
const tenantId = '687b5487bcf61a8335d6b7a3';
const leadId = '687a8d0d94e6f890484ee636';
const notificationId = '687a8b70762cd72932a544d9';

const tests = [
  // USER
  { name: 'User - Create', url: `${baseUrl}/api/user`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ User_Name: 'Test User', phone_no: 1234567890, email: 'testuser_loadtest@example.com', password: 'password123' }) },
  { name: 'User - Get', url: `${baseUrl}/api/user/${userId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  { name: 'User - Update', url: `${baseUrl}/api/user/${userId}`, method: 'PUT', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ User_Name: 'Updated User' }) },
  // // PROPERTY
  { name: 'Property - Create', url: `${baseUrl}/api/property`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ property_name: 'Test Property', description: 'A nice place', rate: '10000', category: 'rent', amenties: [], services: [], images: [], videos: [], furnishing_type: 'Semi-furnished', city: 'Noida', state: 'UP', area: '1200' }) },
  { name: 'Property - Get', url: `${baseUrl}/api/property/${propertyId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  { name: 'Property - Update', url: `${baseUrl}/api/property/${propertyId}`, method: 'PUT', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ property_name: 'Updated Property' }) },
  { name: 'Property - Delete', url: `${baseUrl}/api/property/${propertyId}`, method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  // // APPOINTMENT
  { name: 'Appointment - Create', url: `${baseUrl}/api/appointments`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ user_id: userId, property_id: propertyId, phone: '1234567890', status: 'Pending', whatsappUpdates: true, schedule_Time: new Date().toISOString() }) },
  { name: 'Appointment - Get', url: `${baseUrl}/api/appointments/${appointmentId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  { name: 'Appointment - Update', url: `${baseUrl}/api/appointments/${appointmentId}`, method: 'PUT', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ status: 'Confirmed' }) },
  { name: 'Appointment - Delete', url: `${baseUrl}/api/appointments/${appointmentId}`, method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  // // TENANT
  { name: 'Tenant - Create', url: `${baseUrl}/api/tenant`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Tenant Name', users: [userId], property_id: propertyId, flatNo: '101', society: 'Society Name', members: '3', startDate: new Date().toISOString(), rent: '10000', property_type: 'Normal' }) },
  { name: 'Tenant - Get', url: `${baseUrl}/api/tenant/${tenantId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  { name: 'Tenant - Update', url: `${baseUrl}/api/tenant/${tenantId}`, method: 'PUT', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Updated Tenant' }) },
  { name: 'Tenant - Delete', url: `${baseUrl}/api/tenant/${tenantId}`, method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  // LEAD
  { name: 'Lead - Create', url: `${baseUrl}/api/leads`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ user_id: userId, searchQuery: '2BHK in Noida', contactInfo: { name: 'Lead Name', phone: '1234567890', email: 'lead@example.com' }, status: 'new', notes: 'Looking for quick move-in', source: 'website', priority: 'medium' }) },
  { name: 'Lead - Get', url: `${baseUrl}/api/leads/${leadId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  { name: 'Lead - Update', url: `${baseUrl}/api/leads/${leadId}`, method: 'PUT', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes: 'Updated notes' }) },
  { name: 'Lead - Delete', url: `${baseUrl}/api/leads/${leadId}`, method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  // NOTIFICATION
  { name: 'Notification - Create', url: `${baseUrl}/api/notification`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ user_id: userId, property_id: propertyId, description: 'Rent due soon' }) },
  { name: 'Notification - Get', url: `${baseUrl}/api/notification/${notificationId}`, method: 'GET', headers: { Authorization: `Bearer ${token}` } },
  { name: 'Notification - Update', url: `${baseUrl}/api/notification/${notificationId}`, method: 'PUT', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ description: 'Updated notification' }) },
  { name: 'Notification - Delete', url: `${baseUrl}/api/notification/${notificationId}`, method: 'DELETE', headers: { Authorization: `Bearer ${token}` } },
  // // AMENITIES & SERVICES
  { name: 'Service - Create', url: `${baseUrl}/api/amentiesservice/create-service`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Cleaning' }) },
  { name: 'Amenity - Create', url: `${baseUrl}/api/amentiesservice/create-amenity`, method: 'POST', headers: { 'content-type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name: 'Wifi' }) },
];

async function runTests() {
  const results = [];
  for (const test of tests) {
    console.log(`Running load test: ${test.name}`);
    const res = await new Promise((resolve) => {
      autocannon({
        url: test.url,
        method: test.method,
        headers: test.headers,
        body: test.body,
        connections: 100,
        duration: 10
      }, (err, result) => {
        if (err) {
          console.error(`Error in ${test.name}:`, err);
          resolve({ name: test.name, error: err.message });
        } else {
          resolve({
            name: test.name,
            requests: result.requests.average,
            latency: result.latency.average,
            errors: result.errors,
            timeouts: result.timeouts,
            non2xx: result['non2xx'],
            throughput: result.throughput.average
          });
        }
      });
    });
    results.push(res);
  }
  // Print table
  console.log('\nAPI Load Test Summary (100 users/sec, 10s each):');
  console.log('--------------------------------------------------------------------------');
  console.log('| Endpoint                | Req/sec | Latency (ms) | Errors | Timeouts | Non-2xx | Throughput (Bps) |');
  console.log('--------------------------------------------------------------------------');
  for (const r of results) {
    if (r.error) {
      console.log(`| ${r.name.padEnd(23)} | ERROR: ${r.error}`);
    } else {
      console.log(`| ${r.name.padEnd(23)} | ${String(r.requests).padEnd(7)} | ${String(r.latency).padEnd(12)} | ${String(r.errors).padEnd(6)} | ${String(r.timeouts).padEnd(8)} | ${String(r.non2xx).padEnd(7)} | ${String(r.throughput).padEnd(15)} |`);
    }
  }
  console.log('--------------------------------------------------------------------------');
  writeFileSync('autocannon-summary.json', JSON.stringify(results, null, 2));
  console.log('All tests complete. Summary saved to autocannon-summary.json');
}

runTests(); 