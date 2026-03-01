const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    const { data, error } = await supabase
        .from('user_progress')
        .select('*')
        .limit(1);

    if (error) {
        console.error("Error fetching user_progress:", error);
    } else {
        if (data && data.length > 0) {
            console.log("Columns in user_progress:", Object.keys(data[0]));
        } else {
            console.log("No data in user_progress, can't infer columns from select * unfortunately using this API. But it returned no error.");
        }
    }
}

checkColumns();
