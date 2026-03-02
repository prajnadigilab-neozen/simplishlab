require('dotenv').config();
const { Client } = require('pg');

async function checkPolicies() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });
    try {
        await client.connect();
        const res = await client.query("SELECT * FROM pg_policies WHERE tablename = 'lessons'");
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}
checkPolicies();
