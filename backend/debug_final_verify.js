const supabase = require('./config/supabase');

async function verifyFinalLogin() {
    const testPhone = '9876543210';
    const password = 'Password@123'; // Assuming this is correct for testing

    // Simulating what normalizePhone inside authController does
    const cleaned = testPhone.replace(/\D/g, '');
    const normalized = '+91' + cleaned;

    console.log(`Testing login for ${testPhone} (Normalized to ${normalized})`);

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            phone: normalized,
            password: password
        });

        if (error) {
            console.log(`Result: FAILED - ${error.message}`);

            // Check if user exists but password mismatch
            const { data: { users } } = await supabase.auth.admin.listUsers();
            const user = users.find(u => u.phone === normalized);
            if (user) {
                console.log(`User ${normalized} EXISTS in Auth but login failed. This is likely a password issue, not a format issue.`);
            } else {
                console.log(`User ${normalized} DOES NOT EXIST in Auth. Migration might have missed them or they were never registered.`);
            }
        } else {
            console.log(`Result: SUCCESS! User ID: ${data.user.id}`);
        }
    } catch (e) {
        console.error('Exception during verification:', e.message);
    }
}

verifyFinalLogin();
