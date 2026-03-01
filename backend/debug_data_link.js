const supabase = require('./config/supabase');

async function checkData() {
    console.log('--- Lessons ---');
    const { data: lessons } = await supabase.from('lessons').select('id, title').limit(5);
    console.log(JSON.stringify(lessons, null, 2));

    if (lessons && lessons.length > 0) {
        const lessonId = lessons[0].id;
        console.log(`--- Checking Assessment for Lesson ${lessonId} ---`);
        const { data: assessments } = await supabase.from('assessments').select('*').eq('lesson_id', lessonId);
        console.log('Assessments:', JSON.stringify(assessments, null, 2));

        if (assessments && assessments.length > 0) {
            const assessmentId = assessments[0].id;
            console.log(`--- Checking Questions for Assessment ${assessmentId} ---`);
            const { data: questions } = await supabase.from('questions').select('*').eq('assessment_id', assessmentId);
            console.log('Questions Count:', questions?.length || 0);
            if (questions && questions.length > 0) {
                console.log('First Question Sample:', JSON.stringify(questions[0], null, 2));
            }
        }
    }
}

checkData();
