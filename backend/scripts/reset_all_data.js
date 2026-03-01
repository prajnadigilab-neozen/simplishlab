/**
 * SIMPLISH — Full Data Reset Script
 * 
 * This script removes ALL user data from:
 *   1. Supabase Auth (deletes all auth users)
 *   2. Supabase public tables (truncates all data tables)
 *   3. Local PostgreSQL (truncates all data tables)
 *
 * Usage: node scripts/reset_all_data.js
 * 
 * WARNING: This is DESTRUCTIVE and IRREVERSIBLE. All user accounts,
 *          lessons, assessments, and results will be permanently deleted.
 */

const { Client } = require('pg');
require('dotenv').config();

const supabase = require('../config/supabase');

// ── 1. Wipe Supabase Auth Users ──────────────────────────────────────────
async function wipeSupabaseAuth() {
    console.log('\n🔑 Step 1: Wiping Supabase Auth users...');
    try {
        const { data: { users }, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;

        console.log(`   Found ${users.length} auth users to delete.`);
        for (const user of users) {
            const { error: delError } = await supabase.auth.admin.deleteUser(user.id);
            if (delError) {
                console.warn(`   ⚠ Failed to delete ${user.email || user.phone}: ${delError.message}`);
            } else {
                console.log(`   ✓ Deleted auth user: ${user.email || user.phone || user.id}`);
            }
        }
        console.log('   ✅ Supabase Auth wiped.');
    } catch (err) {
        console.error('   ❌ Supabase Auth wipe failed:', err.message);
    }
}

// ── 2. Wipe Supabase Public Tables ───────────────────────────────────────
async function wipeSupabaseTables() {
    console.log('\n📦 Step 2: Wiping Supabase public tables...');

    // Order matters: child tables first (foreign key constraints)
    const tables = [
        'audit_logs',
        'user_xp_log',
        'assessment_results',
        'placement_results',
        'user_progress',
        'questions',
        'assessments',
        'lessons',
        'placement_questions',
        'users'
    ];

    for (const table of tables) {
        try {
            const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (error) {
                console.warn(`   ⚠ ${table}: ${error.message}`);
            } else {
                console.log(`   ✓ Cleared: ${table}`);
            }
        } catch (err) {
            console.warn(`   ⚠ ${table}: ${err.message}`);
        }
    }
    console.log('   ✅ Supabase public tables wiped.');
}

// ── 3. Wipe Local PostgreSQL ─────────────────────────────────────────────
async function wipeLocalPostgres() {
    console.log('\n🗄  Step 3: Wiping local PostgreSQL...');

    if (!process.env.DATABASE_URL) {
        console.log('   ⏭  Skipped (DATABASE_URL not set).');
        return;
    }

    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
        await client.connect();

        // Truncate tables individually — skip any that don't exist
        const tables = [
            'audit_logs', 'user_xp_log', 'assessment_results',
            'placement_results', 'user_progress', 'questions',
            'assessments', 'lessons', 'placement_questions', 'users'
        ];

        for (const table of tables) {
            try {
                await client.query(`TRUNCATE TABLE public.${table} CASCADE;`);
                console.log(`   ✓ Truncated: ${table}`);
            } catch (e) {
                console.warn(`   ⚠ ${table}: ${e.message.split('\n')[0]}`);
            }
        }

        console.log('   ✅ Local PostgreSQL tables truncated.');
    } catch (err) {
        console.error('   ❌ Local PG wipe error:', err.message);
    } finally {
        await client.end();
    }
}

// ── 4. Clean uploads folder ──────────────────────────────────────────────
function cleanUploads() {
    console.log('\n🗂  Step 4: Cleaning uploads folder...');
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, '..', 'uploads');

    if (!fs.existsSync(uploadsDir)) {
        console.log('   ⏭  No uploads folder found.');
        return;
    }

    const files = fs.readdirSync(uploadsDir);
    let count = 0;
    for (const file of files) {
        if (file === '.gitkeep') continue; // preserve gitkeep
        fs.unlinkSync(path.join(uploadsDir, file));
        count++;
    }
    console.log(`   ✅ Deleted ${count} uploaded files.`);
}

// ── Main ─────────────────────────────────────────────────────────────────
async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log(' SIMPLISH — Full Data Reset');
    console.log(' ⚠  This will DELETE ALL data. Cannot be undone.');
    console.log('═══════════════════════════════════════════════════');

    await wipeSupabaseAuth();
    await wipeSupabaseTables();
    await wipeLocalPostgres();
    cleanUploads();

    console.log('\n═══════════════════════════════════════════════════');
    console.log(' ✅ All data has been reset. Fresh start ready!');
    console.log('═══════════════════════════════════════════════════\n');
}

main().catch(console.error);
