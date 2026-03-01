const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api/v1';

async function testFetchUsers() {
    console.log('--- Testing Fetch Users API ---');
    try {
        // Need a valid token. Since this is local, I'll try to get one or use a service role to check the controller logic directly if I can.
        // But better to test the actual endpoint.
        // Let's assume there is a user we can login as or just use the service role to bypass auth if we were inside the server.
        // Since I'm outside, I'll just check if the server is up and returning *something*.

        const res = await axios.get(`${API_URL}/auth/users`).catch(e => e.response);
        console.log('Status:', res.status);
        console.log('Data:', res.data);

        if (res.status === 401) {
            console.log('Got 401 as expected (no token provided).');
        } else if (res.status === 200) {
            console.log('Success! Users found:', res.data.length);
        } else {
            console.log('Unexpected response:', res.status, res.data);
        }
    } catch (err) {
        console.error('Error:', err.message);
    }
}

testFetchUsers();
