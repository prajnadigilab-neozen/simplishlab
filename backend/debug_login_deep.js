const supabase = require('./config/supabase');
const axios = require('axios');

async function debugLoginDeep() {
    console.log('--- Detailed Auth User Check ---');
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing auth users:', listError);
    } else {
        const targetPhones = ['9876543210', '9876543211'];
        const matches = users.filter(u =>
            targetPhones.some(p => (u.phone && u.phone.includes(p)))
        );

        console.log(`Found ${matches.length} matches:`);
        matches.forEach(m => {
            console.log(`- ID: ${m.id}`);
            console.log(`  Raw Phone (Auth): "${m.phone}"`);
            console.log(`  Email: ${m.email}`);
        });
    }

    const testPhone = '9876543210';
    const password = 'Password@123'; // Assuming this is correct for testing
    const formats = [
        '9876543210',
        '919876543210',
        '+919876543210'
    ];

    console.log('\n--- Testing Login with different formats ---');
    for (const fmt of formats) {
        console.log(`Testing format: "${fmt}"`);
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                phone: fmt,
                password: password
            });
            if (error) {
                console.log(`  Result: FAILED - ${error.message}`);
            } else {
                console.log(`  Result: SUCCESS! User ID: ${data.user.id}`);
            }
        } catch (e) {
            console.log(`  Result: EXCEPTION - ${e.message}`);
        }
    }
}

debugLoginDeep();
