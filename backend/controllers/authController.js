const { createClient } = require('@supabase/supabase-js');
const supabase = require('../config/supabase');
const mediaService = require('../services/mediaService');

// Helper to normalize Indian phone numbers to exactly 10 digits
const normalizePhone = (phone) => {
    if (!phone) return null;
    // Remove all non-numeric characters
    let cleaned = phone.replace(/\D/g, '');
    // Return only the last 10 digits if longer (e.g., 919876543210 -> 9876543210)
    if (cleaned.length >= 10) {
        return cleaned.slice(-10);
    }
    return cleaned;
};

exports.register = async (req, res) => {
    console.log('--- Supabase Registration Attempt ---');
    console.log('Request Body:', req.body);
    const fullName = req.body.fullName || req.body.full_name;
    const { email, phone, password } = req.body;

    // Validation: Require Full Name, Password, and at least one of (Email OR Phone)
    if (!fullName || !password || (!email && !phone)) {
        console.warn('Registration Validation Failed:', { fullName: !!fullName, password: !!password, email: !!email, phone: !!phone });
        return res.status(400).json({
            message: 'Full name, password, and either email or phone are required'
        });
    }

    try {
        const signUpData = { password };
        const options = {
            data: {
                full_name: fullName,
                role: req.body.role || 'user'
            }
        };

        if (phone) {
            signUpData.phone = normalizePhone(phone);

            // Check if phone already exists in public.users to prevent duplicates
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('phone', signUpData.phone)
                .limit(1)
                .maybeSingle();

            if (existingUser) {
                console.warn('Registration Validation Failed: Phone already registered', signUpData.phone);
                return res.status(400).json({
                    message: 'User already Registered'
                });
            }
        } else {
            signUpData.email = email;
        }

        console.log('Calling supabase.auth.signUp with:', JSON.stringify({ ...signUpData, options }, null, 2));

        const { data, error } = await supabase.auth.signUp({
            ...signUpData,
            options
        });

        if (error) {
            console.error('Supabase Register Error:', error);
            return res.status(error.status || 400).json({
                message: error.message,
                details: error
            });
        }

        // Manually sync to public.users (trigger is unreliable)
        try {
            await supabase
                .from('users')
                .upsert({
                    id: data.user.id,
                    full_name: fullName,
                    email: email || null,
                    phone: normalizePhone(phone) || null,
                    role: req.body.role || 'user'
                }, { onConflict: 'id' });
            console.log('User synced to public.users:', data.user.id);
        } catch (syncErr) {
            console.warn('Non-fatal: Failed to sync user to public.users:', syncErr.message);
        }

        res.status(201).json({
            message: 'Registration successful.',
            user: {
                id: data.user.id,
                email: data.user.email,
                phone: data.user.phone,
                fullName: fullName
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

exports.login = async (req, res) => {
    const { email, phone, password } = req.body;

    try {
        const loginOptions = { password };
        if (phone) {
            loginOptions.phone = normalizePhone(phone);
        } else {
            loginOptions.email = email;
        }

        const { data, error } = await supabase.auth.signInWithPassword(loginOptions);

        if (error) {
            console.error('Supabase Login Error:', error);
            return res.status(401).json({ message: error.message });
        }

        if (!data?.session) {
            console.error('Login succeeded but no session returned:', data);
            return res.status(500).json({ message: 'Authentication succeeded but session is missing.' });
        }

        // FETCH PROFILE & CHECK STATUS
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profile?.status === 'inactive') {
            return res.status(403).json({ message: 'Your account has been restricted. Please contact support.' });
        }
        if (profile?.status === 'deleted') {
            return res.status(403).json({ message: 'This account has been deleted.' });
        }

        console.log('Login successful for user:', data.user.id);

        const isProd = process.env.NODE_ENV === 'production';
        res.cookie('simplish_session', data.session.access_token, {
            httpOnly: true,
            secure: isProd, // Should be true in production (requires HTTPS)
            sameSite: isProd ? 'strict' : 'lax', // Protect against CSRF
            maxAge: 3600 * 1000 * 24 * 7 // 7 days (standard Supabase token duration is usually shorter but this allows browser persistence)
        });

        res.json({
            // Still return token for now to avoid breaking existing clients that use it manually,
            // but the goal is to stop relying on it in the JSON body once fixed on frontend.
            token: data.session.access_token,
            user: {
                id: data.user.id,
                fullName: profile?.full_name || data.user.user_metadata?.full_name || 'User',
                email: data.user.email,
                phone: data.user.phone,
                role: profile?.role || data.user.user_metadata?.role || 'user',
                avatarUrl: profile?.avatar_url || null,
                bio: profile?.bio || null,
                location: profile?.location || null,
                onboarding_completed: profile?.onboarding_completed || false,
                current_level: profile?.current_level
            }
        });
    } catch (error) {
        console.error('Critical Login error:', error);
        res.status(500).json({
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

exports.logout = async (req, res) => {
    res.clearCookie('simplish_session');
    res.json({ message: 'Logged out successfully' });
};

exports.updateProfile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { fullName, email, phone, password, bio, location } = req.body;
    let avatarUrl = req.file ? mediaService.getUrl(req.file.filename) : undefined;

    try {
        // 0. Get current user data to avoid redundant Auth updates
        const { data: { user: currentUser }, error: fetchError } = await supabase.auth.admin.getUserById(userId);
        if (fetchError || !currentUser) return res.status(404).json({ message: 'User not found in Auth system' });

        // 1. Update Supabase Auth only if fields actually changed
        const authUpdates = {};
        if (email && email !== currentUser.email) authUpdates.email = email;
        if (phone && phone !== currentUser.phone) authUpdates.phone = phone;
        if (password) authUpdates.password = password;

        // Use user_metadata for custom fields, PRESERVE existing metadata (like role)
        const user_metadata = { ...(currentUser.user_metadata || {}) };
        let metaChanged = false;

        if (fullName && fullName !== user_metadata.full_name) {
            user_metadata.full_name = fullName;
            metaChanged = true;
        }
        if (avatarUrl && avatarUrl !== user_metadata.avatar_url) {
            user_metadata.avatar_url = avatarUrl;
            metaChanged = true;
        }

        if (metaChanged) {
            authUpdates.user_metadata = user_metadata;
        }

        if (Object.keys(authUpdates).length > 0) {
            const { error: authError } = await supabase.auth.admin.updateUserById(userId, authUpdates);
            if (authError) return res.status(400).json({ message: authError.message });
        }

        // 2. Update public.users profile
        const profileUpdates = {};
        if (fullName) profileUpdates.full_name = fullName;
        if (email) profileUpdates.email = email;
        if (phone) profileUpdates.phone = normalizePhone(phone);
        if (bio !== undefined) profileUpdates.bio = bio;
        if (location !== undefined) profileUpdates.location = location;
        if (avatarUrl) {
            // Get current profile to find old avatar for deletion
            const { data: profile } = await supabase.from('users').select('avatar_url').eq('id', userId).maybeSingle();
            if (profile?.avatar_url) {
                await mediaService.deleteFile(profile.avatar_url);
            }
            profileUpdates.avatar_url = avatarUrl;
        }

        if (Object.keys(profileUpdates).length > 0) {
            let updatedProfile, profileError;

            ({ data: updatedProfile, error: profileError } = await supabase
                .from('users')
                .update(profileUpdates)
                .eq('id', userId)
                .select()
                .maybeSingle());

            // If columns like bio/location/avatar_url don't exist yet, retry with core fields only
            if (profileError && (profileError.code === '42703' || profileError.message?.includes('schema cache'))) {
                console.warn('Profile columns not found in schema, retrying with core fields only');
                const coreUpdates = {};
                if (fullName) coreUpdates.full_name = fullName;
                if (email) coreUpdates.email = email;
                if (phone) coreUpdates.phone = phone;

                if (Object.keys(coreUpdates).length > 0) {
                    ({ data: updatedProfile, error: profileError } = await supabase
                        .from('users')
                        .update(coreUpdates)
                        .eq('id', userId)
                        .select()
                        .maybeSingle());
                } else {
                    profileError = null;
                }
            }

            if (profileError) return res.status(400).json({ message: profileError.message });

            // If no row was updated (user not in public.users), fetch current data
            if (!updatedProfile) {
                const { data: currentProfile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .maybeSingle();
                updatedProfile = currentProfile;
            }

            return res.json({
                message: 'Profile updated',
                user: {
                    id: updatedProfile?.id || userId,
                    fullName: updatedProfile?.full_name || fullName,
                    email: updatedProfile?.email || email,
                    phone: updatedProfile?.phone || phone,
                    role: updatedProfile?.role || user_metadata.role || 'user',
                    avatarUrl: updatedProfile?.avatar_url || null,
                    bio: updatedProfile?.bio || null,
                    location: updatedProfile?.location || null,
                    onboarding_completed: updatedProfile?.onboarding_completed || false,
                    current_level: updatedProfile?.current_level
                }
            });
        }

        res.json({ message: 'No changes made' });
    } catch (err) {
        console.error('updateProfile error:', err);
        res.status(500).json({ message: 'Server error during profile update' });
    }
};

exports.getAllUsers = async (req, res) => {
    console.log('--- getAllUsers Attempt (Paginated) ---');
    console.log('Request User:', req.user?.id, 'Role:', req.user?.role);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    try {
        // Create a fresh client to ensure service role bypasses any stateful RLS
        const adminClient = createClient(process.env.SUPABASE_URL?.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());

        // Get total count first
        const { count, error: countError } = await adminClient
            .from('users')
            .select('*', { count: 'exact', head: true });

        console.log('Total users count from DB:', count);
        if (countError) throw countError;

        const { data, error } = await adminClient
            .from('users')
            .select('*')
            .order('created_at', { ascending: false })
            .range(start, end);

        console.log('Data returned from range query:', data?.length);

        if (error) {
            console.error('Supabase getAllUsers Error:', error);
            return res.status(error.status || 400).json({ message: error.message });
        }

        res.json({
            users: data || [],
            pagination: {
                totalUsers: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error('getAllUsers error:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.updateRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (!['super_admin', 'admin', 'moderator', 'user'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    try {
        // Fetch current user metadata to avoid overwriting other fields (like full_name)
        const { data: user, error: fetchError } = await supabase.auth.admin.getUserById(id);
        if (fetchError || !user) throw fetchError || new Error('User not found');

        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
            user_metadata: { ...user.user_metadata, role }
        });
        if (authError) throw authError;

        const { data, error: profileError } = await supabase
            .from('users')
            .update({ role })
            .eq('id', id)
            .select('id, full_name, role')
            .single();

        if (profileError) throw profileError;

        res.json({ message: 'User role updated', user: data });
    } catch (err) {
        console.error('updateRole error:', err);
        res.status(500).json({ message: 'Error updating role' });
    }
};
exports.getProfile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Try to get profile from public.users table
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        // If found in DB, return that (most accurate/up-to-date)
        if (profile) {
            return res.json({
                user: {
                    id: profile.id,
                    fullName: profile.full_name,
                    email: profile.email,
                    phone: profile.phone,
                    role: profile.role,
                    avatarUrl: profile.avatar_url || null,
                    bio: profile.bio || null,
                    location: profile.location || null,
                    onboarding_completed: profile.onboarding_completed || false,
                    current_level: profile.current_level
                }
            });
        }

        // Fallback: If not found in public.users, return what we have from the token
        // Use req.user which was populated by authMiddleware
        res.json({
            user: {
                id: userId,
                fullName: req.user.fullName || req.user.full_name || 'User',
                email: req.user.email,
                phone: req.user.phone,
                role: req.user.role || 'user',
                onboarding_completed: false // Default if no DB profile
            }
        });
    } catch (err) {
        console.error('getProfile error:', err);
        // Even on error, try to return basic info if we have req.user
        if (req.user) {
            return res.json({
                user: {
                    id: userId,
                    role: req.user.role || 'user',
                    email: req.user.email
                }
            });
        }
    }
};

exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    const actorId = req.user?.id;

    try {
        // Rule 21: GDPR Compliance — Hard delete, not soft delete
        // 1. Delete progress
        await supabase.from('user_progress').delete().eq('user_id', id);
        
        // 2. Delete Profile
        const { error: profileError } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (profileError) throw profileError;

        // 3. Delete Auth User (Supabase Admin)
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) throw authError;

        res.json({ message: 'User permanently deleted (GDPR compliant)' });
    } catch (err) {
        console.error('deleteUser error:', err);
        res.status(500).json({ message: 'Error deleting user' });
    }
};

exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: `User status updated to ${status}`, user: data });
    } catch (err) {
        console.error('updateStatus error:', err);
        res.status(500).json({ message: 'Error updating status' });
    }
};

exports.deleteMe = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    try {
        // Rule 21: GDPR Compliance — Hard delete, not soft delete
        // 1. Delete progress
        await supabase.from('user_progress').delete().eq('user_id', userId);
        
        // 2. Delete Profile (this usually cascades if FK is set, but better safe)
        const { error: profileError } = await supabase
            .from('users')
            .delete()
            .eq('id', userId);

        if (profileError) throw profileError;

        // 3. Delete Auth Account
        const { error: authError } = await supabase.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        res.clearCookie('simplish_session');
        res.json({ message: 'Your account has been permanently deleted.' });
    } catch (err) {
        console.error('deleteMe error:', err);
        res.status(500).json({ message: 'Error deleting account' });
    }
};

exports.getSystemLogs = async (req, res) => {
    // Verified by isSuperAdmin middleware, but double check
    if (req.user?.role !== 'super_admin') {
        return res.status(403).json({ message: 'Only Super Admins can view system logs' });
    }

    try {
        const adminClient = createClient(process.env.SUPABASE_URL?.trim(), process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
        const { data, error } = await adminClient
            .from('system_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Supabase getSystemLogs Error:', error);
            if (error.code === '42P01') return res.json({ logs: [] }); // Table missing gracefully handled
            return res.status(400).json({ message: error.message });
        }

        res.json({ logs: data || [] });
    } catch (err) {
        console.error('getSystemLogs error:', err);
        res.status(500).json({ message: 'Error fetching system logs' });
    }
};
