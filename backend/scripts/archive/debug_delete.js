require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const lessonId = 'fb2ea3eb-c49c-4df5-8dc6-9efca17b4316';

async function debugDelete() {
    console.log(`🚀 Attempting to delete lesson: ${lessonId}`);

    try {
        // 1. Check if it exists
        const { data: lesson, error: fetchError } = await supabase
            .from('lessons')
            .select('*')
            .eq('id', lessonId)
            .single();

        if (fetchError) {
            console.error("❌ Fetch Error:", fetchError);
            return;
        }
        console.log("✅ Lesson found:", lesson.title);

        // 2. Check for dependencies (assessments)
        const { data: assessments, error: aError } = await supabase
            .from('assessments')
            .select('id')
            .eq('lesson_id', lessonId);

        console.log(`Found ${assessments?.length || 0} assessments.`);

        // 3. Try deleting
        console.log("⏳ Attempting deletion...");
        const { error: deleteError } = await supabase
            .from('lessons')
            .delete()
            .eq('id', lessonId);

        if (deleteError) {
            console.error("❌ Delete Failed:", deleteError);
        } else {
            console.log("✅ Delete successful!");
        }
    } catch (err) {
        console.error("💥 Unexpected Error:", err);
    }
}

debugDelete();
