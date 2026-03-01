const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
const TEST_ACCOUNT = {
    phone: '9876543210',
    password: 'password123'
};

async function runRegression() {
    console.log('🚀 Starting SIMPLISH Regression Suite...\n');

    const results = [];

    // 1. Auth & Cookie Set Test
    try {
        console.log('Testing: Login & Cookie Persistence...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, TEST_ACCOUNT);
        const cookies = loginRes.headers['set-cookie'];
        const hasCookie = cookies && cookies.some(c => c.includes('simplish_session'));

        results.push({ name: 'Auth Cookie Set', status: hasCookie ? 'PASS' : 'FAIL' });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };

        // 2. Pagination Test
        console.log('Testing: User Pagination...');
        try {
            const userRes = await axios.get(`${API_URL}/auth/users?page=1&limit=5`, { headers });
            const hasPagination = userRes.data.pagination && userRes.data.pagination.totalPages !== undefined;
            results.push({ name: 'User Pagination API', status: hasPagination ? 'PASS' : 'FAIL' });
        } catch (e) {
            results.push({ name: 'User Pagination API', status: 'FAIL', error: e.message });
        }

        // 3. Lesson Access (Public)
        console.log('Testing: Public Lesson Access...');
        try {
            const lessonRes = await axios.get(`${API_URL}/lessons`);
            results.push({ name: 'Public Lesson Fetch', status: lessonRes.status === 200 ? 'PASS' : 'FAIL' });
        } catch (e) {
            results.push({ name: 'Public Lesson Fetch', status: 'FAIL' });
        }

        // 4. Assessment Protection Regression
        console.log('Testing: Assessment Protection...');
        try {
            await axios.post(`${API_URL}/assessments/submit`, {});
            results.push({ name: 'Assessment Protection', status: 'FAIL (unprotected)' });
        } catch (e) {
            results.push({ name: 'Assessment Protection', status: e.response?.status === 401 ? 'PASS' : 'FAIL' });
        }

    } catch (err) {
        console.error('Critical Error in Regression Suite:', err.message);
        results.push({ name: 'Critical Suite Run', status: 'BLOCKER', error: err.message });
    }

    console.log('\n📊 REGRESSION TEST SUMMARY:');
    results.forEach(r => {
        console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.name}: ${r.status} ${r.error ? `(${r.error})` : ''}`);
    });
}

runRegression();
