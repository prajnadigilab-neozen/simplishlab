const supabase = require('./config/supabase');

async function testWithToken() {
    let testUserId = null;
    try {
        const testPhone = '+1' + Math.floor(Math.random() * 1000000000).toString().padStart(10, '0');
        const password = 'Password123!';

        console.log('Creating test user with phone...', testPhone);
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
            phone: testPhone,
            password,
            options: { data: { role: 'super_admin', full_name: 'Test Admin' } }
        });

        if (signUpErr) {
            console.log('Signup err:', signUpErr);
            return;
        }
        testUserId = signUpData.user.id;

        await supabase.from('users').upsert({
            id: testUserId,
            phone: testPhone,
            role: 'super_admin',
            full_name: 'Test Admin'
        });

        console.log('Logging in...');
        const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({
            phone: testPhone,
            password
        });

        if (loginErr) {
            console.log('Login err:', loginErr);
            return;
        }
        const token = loginData.session.access_token;

        console.log('Calling /api/v1/auth/users...');
        const res = await fetch('http://localhost:5000/api/v1/auth/users', {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Response status:', res.status);
        const data = await res.json();
        console.log('Users received:', Array.isArray(data) ? data.length : data);
        if (Array.isArray(data) && data.length > 0) {
            console.log('Sample user:', JSON.stringify(data[0], null, 2));
        }

    } catch (err) {
        console.log('Test failed:', err.message);
    } finally {
        if (testUserId) {
            await supabase.auth.admin.deleteUser(testUserId);
            console.log('Cleanup done');
        }
    }
}

testWithToken();
