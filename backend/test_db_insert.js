require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const adminSupabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function run() {
    try {
        console.log("Checking assessments...");
        const { data: assessments } = await adminSupabase.from('assessments').select('*').limit(1);

        if (!assessments || assessments.length === 0) {
            console.log("No assessments found to attach a question to.");
            return;
        }

        const assessmentId = assessments[0].id;
        console.log(`Using assessment ID: ${assessmentId}`);

        const testQuestion = {
            assessment_id: assessmentId,
            question_text: "Does this save?",
            question_type: "Text",
            correct_answer: "Yes",
            options: null,
            points: 10,
            explanation: "Testing"
        };

        console.log("Inserting question...");
        const { data, error } = await adminSupabase.from('questions').insert([testQuestion]).select();

        if (error) {
            console.error("DB Error:", error);
        } else {
            console.log("Success! Data:", data);

            // Clean up
            await adminSupabase.from('questions').delete().eq('id', data[0].id);
            console.log("Cleaned up test question.");
        }
    } catch (err) {
        console.error("Script error:", err);
    }
}

run();
