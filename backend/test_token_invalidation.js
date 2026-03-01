const supabase = require('./config/supabase');
require('dotenv').config();

async function testTokenInvalidation() {
    // 1. Create a temporary user or use an existing one
    const phone = `+9198${Math.floor(10000000 + Math.random() * 90000000)}`;
    const password = 'Password123!';

    console.log('--- Step 1: Registering test user with phone ---');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        phone,
        password,
        options: { data: { full_name: 'Test Token User' } }
    });

    if (signUpError) {
        console.error('Sign up failed:', signUpError.message);
        return;
    }
    const user = signUpData.user;
    const token = signUpData.session.access_token;
    console.log('User registered. Token acquired.');

    // 2. Verify token works
    console.log('--- Step 2: Verifying token works ---');
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError) {
        console.error('Initial getUser failed:', userError.message);
        return;
    }
    console.log('Initial getUser successful.');

    // 3. Update user phone to the SAME value via admin API
    console.log(`--- Step 3: Updating phone to the SAME value (${phone}) via admin API ---`);
    const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
        phone: phone
    });

    if (updateError) {
        console.error('Admin update failed:', updateError.message);
    } else {
        console.log('Admin update successful.');
    }

    // 4. Verify token STILL works
    console.log('--- Step 4: Verifying token STILL works ---');
    const { data: userData2, error: userError2 } = await supabase.auth.getUser(token);
    if (userError2) {
        console.log('❌ Token INVALIDATED after phone update (even if same):', userError2.message);
    } else {
        console.log('✅ Token still VALID after phone update (same value).');
    }

    // 5. Cleanup
    await supabase.auth.admin.deleteUser(user.id);
    console.log('Test user deleted.');
}

testTokenInvalidation();
