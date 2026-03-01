const axios = require('axios');
const supabase = require('./config/supabase');

const API_URL = 'http://localhost:5000/api/v1';
const ADMIN_PHONE = '9876543210';
const ADMIN_PASS = 'password123';

async function testApi() {
    console.log('--- Testing getAllUsers API ---');
    try {
        // 1. Login
        const loginRes = await axios.post(`${API_URL}/auth/login`, { phone: ADMIN_PHONE, password: ADMIN_PASS });
        const token = loginRes.data.token;
        console.log('Login Successful, Role:', loginRes.data.user.role);

        // 2. Call getAllUsers
        const res = await axios.get(`${API_URL}/auth/users`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('API Response Structure:', Object.keys(res.data));
        console.log('Users Count in Response:', res.data.users?.length);
        console.log('Pagination Metadata:', res.data.pagination);

        if (res.data.users && res.data.users.length > 0) {
            console.log('Sample User Phone:', res.data.users[0].phone);
        }

        // 3. Direct DB Check (to compare)
        const { count, error } = await supabase.from('users').select('*', { count: 'exact', head: true });
        console.log('Direct DB Count (public.users):', count);

    } catch (err) {
        console.error('Error:', err.response?.data || err.message);
    }
}

testApi();
