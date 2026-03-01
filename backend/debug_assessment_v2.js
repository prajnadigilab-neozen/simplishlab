
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: 'd:/Prajna/Simplish/backend/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
    const results = {};

    // 1. Get all assessments
    const { data: assessments, error: asErr } = await supabase.from('assessments').select('*');
    results.assessments = assessments || [];
    results.assessmentsError = asErr;

    // 2. Get all questions
    const { data: questions, error: qErr } = await supabase.from('questions').select('*');
    results.questions = questions || [];
    results.questionsError = qErr;

    // 3. Get all lessons
    const { data: lessons, error: lErr } = await supabase.from('lessons').select('id, title');
    results.lessons = lessons || [];
    results.lessonsError = lErr;

    fs.writeFileSync('debug_assessment_results.json', JSON.stringify(results, null, 2));
    console.log('Results written to debug_assessment_results.json');
    process.exit(0);
}

debug();
