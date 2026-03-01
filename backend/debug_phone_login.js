const axios = require('axios');

async function debugLogin() {
    const phones = ['9876543210', '9876543211'];
    const password = 'Password@123'; // Typical test password if known, otherwise this will fail as expected

    for (const phone of phones) {
        console.log(`--- Testing Login for: ${phone} ---`);
        try {
            const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
                phone,
                password
            });
            console.log(`Success for ${phone}:`, res.status);
        } catch (err) {
            console.log(`Failed for ${phone}:`);
            if (err.response) {
                console.log(`Status: ${err.response.status}`);
                console.log(`Message: ${err.response.data.message}`);
            } else {
                console.log(`Error: ${err.message}`);
            }
        }

        const prefPhone = `91${phone}`;
        console.log(`--- Testing Login for: ${prefPhone} ---`);
        try {
            const res = await axios.post('http://localhost:5000/api/v1/auth/login', {
                phone: prefPhone,
                password
            });
            console.log(`Success for ${prefPhone}:`, res.status);
        } catch (err) {
            console.log(`Failed for ${prefPhone}:`);
            if (err.response) {
                console.log(`Status: ${err.response.status}`);
                console.log(`Message: ${err.response.data.message}`);
            } else {
                console.log(`Error: ${err.message}`);
            }
        }
    }
}

debugLogin();
