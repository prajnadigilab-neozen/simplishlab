const axios = require('axios');

async function testLogin() {
    try {
        console.log('Attempting login to http://localhost:5000/api/v1/auth/login...');
        const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
            phone: '1234567890',
            password: 'password123'
        });
        console.log('Response Status:', res.status);
        console.log('Response Data:', res.data);
    } catch (err) {
        console.error('Error Status:', err.response?.status);
        console.error('Error Data:', err.response?.data);
        if (!err.response) {
            console.error('Network Error or Server Down:', err.message);
        }
    }
}

testLogin();
