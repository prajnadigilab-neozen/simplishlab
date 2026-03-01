const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugUpsertAssessment() {
    console.log('Testing Upsert Assessment...');
    const lessonId = '00000000-0000-0000-0000-000000000000'; // dummy UUID
    const title = 'Test Assessment';
    const questions = [
        { text: 'Q1', type: 'MCQ', correct_answer: 'A', options: ['A', 'B'], points: 10 }
    ];

    try {
        console.log('1. Upsert Assessment');
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .upsert({ lesson_id: lessonId, title: title || 'Assessment' }, { onConflict: 'lesson_id' })
            .select()
            .single();

        if (assessmentError) {
            console.error('assessmentError:', assessmentError);
            return;
        }

        console.log('Assessment created/updated:', assessment.id);
        const assessmentId = assessment.id;

        console.log('2. Delete existing questions');
        const { error: deleteError } = await supabase
            .from('questions')
            .delete()
            .eq('assessment_id', assessmentId);

        if (deleteError) {
            console.error('deleteError:', deleteError);
            return;
        }

        console.log('3. Insert new questions');
        const questionsToInsert = questions.map(q => ({
            assessment_id: assessmentId,
            question_text: q.text,
            question_type: q.type,
            correct_answer: q.correct_answer,
            options: q.options || null,
            points: q.points || 10,
            explanation: q.explanation || null
        }));

        const { error: questionsInsertError } = await supabase
            .from('questions')
            .insert(questionsToInsert);

        if (questionsInsertError) {
            console.error('questionsInsertError:', questionsInsertError);
            return;
        }

        console.log('Success!');
    } catch (error) {
        console.error("Caught Upsert Assessment Error:", error);
    }
}

debugUpsertAssessment();
