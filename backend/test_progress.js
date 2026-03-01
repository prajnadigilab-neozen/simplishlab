const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const BASE_URL = 'http://localhost:5000/api/v1'; // Assuming backend runs on 5000

async function testProgress() {
    try {
        // 1. Get a test token (Login first)
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            phone: '9876543210',
            password: 'password123'
        });

        const token = loginRes.data.token;
        if (!token) {
            console.log("Failed to login");
            return;
        }

        // 2. Fetch a lesson to get a valid ID
        const lessonsRes = await axios.get(`${BASE_URL}/lessons`);
        const lesson = lessonsRes.data.lessons[0];

        if (!lesson) {
            console.log("No lessons found.");
            return;
        }

        console.log(`Testing progress update for lesson ID: ${lesson.id}`);

        // 3. Hit the progress endpoint
        const progressRes = await axios.post(`${BASE_URL}/lessons/${lesson.id}/progress`, {
            spentTimeMs: 6000,
            status: 'started'
        }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Progress updated successfully:", progressRes.data);

    } catch (error) {
        if (error.response) {
            console.error("Endpoint Error:", error.response.status, error.response.data);
        } else {
            console.error("Network/Other Error:", error.message);
        }
    }
}

testProgress();
