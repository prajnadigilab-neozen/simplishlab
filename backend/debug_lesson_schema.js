const supabase = require('./config/supabase');

async function checkLessonSchema() {
    console.log('--- Checking Lesson Sample ---');
    const { data, error } = await supabase.from('lessons').select('*').limit(1);
    if (error) {
        console.error('Fetch error:', error);
    } else if (data && data.length > 0) {
        console.log('Sample Lesson:', JSON.stringify(data[0], null, 2));
        // Check capitalizations
        const keys = Object.keys(data[0]);
        console.log('Columns:', keys.join(', '));
    } else {
        console.log('No lessons found.');
    }
}

checkLessonSchema();
