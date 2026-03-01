const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables in .env');
    process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function runDailyCleanup() {
    console.log(`[${new Date().toISOString()}] Starting daily system cleanup...`);
    const logs = {
        deletedFiles: [],
        deletedOrphanedUsers: 0,
        errors: []
    };

    try {
        // 1. CLEAR ORPHANED SUPABASE AUTH USERS (from earlier issue)
        console.log('Checking for orphaned Auth users...');
        const { data: publicUsers, error: publicDbError } = await supabaseAdmin.from('users').select('id');
        if (!publicDbError && publicUsers) {
            const publicUserIds = new Set(publicUsers.map(u => u.id));
            let allAuthUsers = [];
            let page = 1;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: page, perPage: 1000 });
                if (error) throw error;
                if (data.users && data.users.length > 0) {
                    allAuthUsers = [...allAuthUsers, ...data.users];
                    page++;
                } else {
                    hasMore = false;
                }
            }

            const orphanedUsers = allAuthUsers.filter(u => !publicUserIds.has(u.id));
            for (const user of orphanedUsers) {
                const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
                if (!deleteError) logs.deletedOrphanedUsers++;
                else logs.errors.push(`Failed to delete orphaned user ${user.id}: ${deleteError.message}`);
            }
        }

        // 2. CLEAN UP OLD TEMPORARY JUNK FILES IN /uploads
        // In a real app, you might check if files in 'uploads' are actually linked in the DB
        // For this automated cleanup, we will look for files starting with 'temp-' or files older than 30 days
        console.log('Scanning uploads directory for junk files...');
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        if (fs.existsSync(uploadsDir)) {
            const files = fs.readdirSync(uploadsDir);
            const now = Date.now();
            const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

            for (const file of files) {
                const filePath = path.join(uploadsDir, file);
                const stats = fs.statSync(filePath);

                // Delete if it starts with 'temp-' OR if it's older than 30 days AND not linked (simplified here by just age)
                // CAUTION: In production, ensure you don't delete active avatars/lessons if they are old.
                // We will specifically target explicit 'temp-' files or '.tmp' extensions
                if (file.startsWith('temp-') || file.endsWith('.tmp') || file.endsWith('.junk')) {
                    fs.unlinkSync(filePath);
                    logs.deletedFiles.push(file);
                }
            }
        }

    } catch (err) {
        console.error('Error during cleanup:', err);
        logs.errors.push(err.message);
    } finally {
        // 3. LOG THE RUN TO THE SYSTEM_LOGS TABLE
        console.log('Saving cleanup report to database...');
        const { error: logError } = await supabaseAdmin.from('system_logs').insert([{
            event_type: 'automated_cleanup',
            details: logs
        }]);

        if (logError) {
            console.error('Failed to save to system_logs. Ensure the table exists! Error:', logError.message);
        } else {
            console.log(`[${new Date().toISOString()}] Cleanup complete. Report saved.`);
        }
    }
}

// Allow running directly or via cron module
if (require.main === module) {
    runDailyCleanup();
}

module.exports = runDailyCleanup;
