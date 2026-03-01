const supabase = require('./config/supabase');

async function checkSpecificLesson() {
    const lessonId = '30806802-c3ca-42db-87fb-a02a77338516';
    console.log(`--- Checking Lesson: ${lessonId} ---`);

    const { data: lesson, error: lessonError } = await supabase.from('lessons').select('*').eq('id', lessonId).maybeSingle();
    console.log('Lesson found:', !!lesson);
    if (lessonError) console.error('Lesson error:', lessonError);

    const { data: assessment, error: assessmentError } = await supabase.from('assessments').select('*').eq('lesson_id', lessonId).maybeSingle();
    console.log('Assessment found:', !!assessment);
    if (assessmentError) console.error('Assessment error:', assessmentError);

    if (assessment) {
        console.log('Assessment ID:', assessment.id);
        const { data: questions, error: qError } = await supabase.from('questions').select('*').eq('assessment_id', assessment.id);
        console.log('Questions found:', questions?.length || 0);
        if (qError) console.error('Questions error:', qError);
    }
}

checkSpecificLesson();
