const axios = require('axios');

async function testSecurity() {
    const API_URL = 'http://localhost:5000/api/v1';

    console.log('--- Security Audit Simulation ---');

    // 1. Verify Unprotected Endpoints are now protected
    const targets = [
        { name: 'Submit Assessment', url: `${API_URL}/assessments/submit`, method: 'post' },
        { name: 'Process Media', url: `${API_URL}/assessments/process-media`, method: 'post' }
    ];

    for (const target of targets) {
        try {
            await axios({ method: target.method, url: target.url });
            console.error(`❌ FAILURE: ${target.name} is still unprotected!`);
        } catch (err) {
            if (err.response?.status === 401) {
                console.log(`✅ SUCCESS: ${target.name} is now protected (401).`);
            } else {
                console.log(`ℹ️ NOTE: ${target.name} gave status ${err.response?.status}`);
            }
        }
    }

    console.log('\n--- Cookie Persistence Test ---');
    console.log('Note: Manual browser verification required for HttpOnly flag.');
}

testSecurity();
