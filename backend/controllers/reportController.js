const supabase = require('../config/supabase');

/**
 * Get Summary Metrics for the Dashboard
 */
exports.getSummaryMetrics = async (req, res) => {
    try {
        // 1. Total Registered Users
        let totalUsers = 0;
        try {
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .neq('status', 'deleted');
            totalUsers = count || 0;
        } catch (_) { /* non-critical */ }

        // 2. Active Users Today (Last 24h)
        let activeToday = 0;
        try {
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gt('last_login_at', dayAgo);
            activeToday = count || 0;
        } catch (_) { /* non-critical */ }

        // 3. Deleted Users (directly from users table status)
        let deletedUsers = 0;
        try {
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'deleted');
            deletedUsers = count || 0;
        } catch (_) { /* non-critical */ }

        // 3b. Inactive Users
        let inactiveUsers = 0;
        try {
            const { count } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'inactive');
            inactiveUsers = count || 0;
        } catch (_) { /* non-critical */ }

        // 4. Level Distribution
        let levelStats = {};
        try {
            const { data: levelData } = await supabase
                .from('users')
                .select('current_level');
            levelStats = (levelData || []).reduce((acc, curr) => {
                const lvl = curr.current_level || 'Not Started';
                acc[lvl] = (acc[lvl] || 0) + 1;
                return acc;
            }, {});
        } catch (_) { /* non-critical */ }

        // 5. Total Active Time (Sum of spent_time_ms from user_progress)
        let totalHours = '0.00';
        try {
            const { data: progressData } = await supabase
                .from('user_progress')
                .select('spent_time_ms');
            const totalTimeMs = (progressData || []).reduce((sum, p) => sum + (Number(p.spent_time_ms) || 0), 0);
            totalHours = (totalTimeMs / (1000 * 60 * 60)).toFixed(2);
        } catch (_) { /* user_progress may not have spent_time_ms yet */ }

        res.json({
            totalUsers,
            activeToday,
            deletedUsers,
            inactiveUsers,
            levelDistribution: levelStats,
            totalActiveHours: totalHours
        });
    } catch (error) {
        console.error('getSummaryMetrics error:', error);
        res.status(500).json({ message: 'Error generating report summary' });
    }
};

/**
 * Get Detailed Activity per Lesson
 */
exports.getActivityDetails = async (req, res) => {
    try {
        let activity = [];
        try {
            // Fetch progress and join with users/lessons
            const { data: progressData, error: progressError } = await supabase
                .from('user_progress')
                .select(`
                    user_id,
                    lesson_id,
                    spent_time_ms,
                    status,
                    completion_percentage,
                    last_accessed_at,
                    users ( full_name ),
                    lessons ( id, title, level )
                `)
                .order('last_accessed_at', { ascending: false })
                .limit(50);

            if (progressError) throw progressError;

            // Fetch assessment results for these users/lessons to get scores
            const userIds = [...new Set(progressData.map(p => p.user_id))];
            const { data: resultsData, error: resultsError } = await supabase
                .from('assessment_results')
                .select(`
                    user_id,
                    score,
                    passed,
                    completed_at,
                    assessments ( lesson_id )
                `)
                .in('user_id', userIds);

            if (resultsError) {
                console.warn('Could not fetch assessment results for report:', resultsError.message);
            }

            // Merge Data
            activity = (progressData || []).map(p => {
                // Find matching score for this lesson (via assessment join)
                const result = resultsData?.find(r =>
                    r.user_id === p.user_id &&
                    r.assessments?.lesson_id === p.lesson_id
                );

                return {
                    student: p.users?.full_name || 'Anonymous',
                    lesson: p.lessons?.title || 'Unknown Lesson',
                    level: p.lessons?.level,
                    status: p.status,
                    progress: p.completion_percentage,
                    timeSpentMin: (Number(p.spent_time_ms || 0) / 60000).toFixed(1),
                    lastAccessed: p.last_accessed_at,
                    score: result ? result.score : null,
                    passed: result ? result.passed : null,
                    atRisk: (p.spent_time_ms > 1800000 && p.completion_percentage < 50) // > 30 mins and < 50%
                };
            });

        } catch (innerErr) {
            console.warn('getActivityDetails inner error (non-fatal):', innerErr.message);
        }

        res.json(activity);
    } catch (error) {
        console.error('getActivityDetails error:', error);
        res.status(500).json({ message: 'Error fetching activity details' });
    }
};
