const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const runMigration = async () => {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        const sql = fs.readFileSync(path.join(__dirname, 'scripts', 'reports_migration.sql'), 'utf8');
        await client.query(sql);
        console.log('Reports Migration successful!');
    } catch (err) {
        console.error('Reports Migration failed:', err);
    } finally {
        await client.end();
    }
};

runMigration();
