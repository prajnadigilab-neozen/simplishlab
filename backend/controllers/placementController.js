const supabase = require('../config/supabase');

/**
 * Fetch adaptive placement questions.
 * Simply returns 2 questions from each level for now.
 */
exports.getQuestions = async (req, res) => {
    try {
        const levels = ['Basic', 'Intermediate', 'Advanced', 'Expert'];
        let selectedQuestions = [];

        for (const level of levels) {
            const { data, error } = await supabase
                .from('placement_questions')
                .select('id, question_text, options, difficulty_level')
                .eq('difficulty_level', level)
                .limit(2);

            if (error) throw error;
            if (data) selectedQuestions = selectedQuestions.concat(data);
        }

        res.json(selectedQuestions);
    } catch (error) {
        console.error('getQuestions error:', error);
        res.status(500).json({ message: 'Error fetching placement questions' });
    }
};

/**
 * Submit placement test results.
 */
exports.submitTest = async (req, res) => {
    const userId = req.user?.id;
    const { answers } = req.body;

    if (!userId || !answers) {
        return res.status(400).json({ message: 'Missing user context or answers' });
    }

    try {
        const questionIds = Object.keys(answers);
        const { data: questions, error: qError } = await supabase
            .from('placement_questions')
            .select('id, correct_answer, difficulty_level')
            .in('id', questionIds);

        if (qError) throw qError;

        let totalCorrect = 0;
        let totalQuestions = questions.length;
        let scorePerLevel = {
            'Basic': { correct: 0, total: 0 },
            'Intermediate': { correct: 0, total: 0 },
            'Advanced': { correct: 0, total: 0 },
            'Expert': { correct: 0, total: 0 }
        };

        questions.forEach(q => {
            const level = q.difficulty_level;
            scorePerLevel[level].total++;
            if (answers[q.id] === q.correct_answer) {
                scorePerLevel[level].correct++;
                totalCorrect++;
            }
        });

        const scorePercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

        let assignedLevel = 'Basic';
        const levels = ['Expert', 'Advanced', 'Intermediate', 'Basic'];
        for (const lvl of levels) {
            if (scorePerLevel[lvl].total > 0 && (scorePerLevel[lvl].correct / scorePerLevel[lvl].total) >= 0.5) {
                assignedLevel = lvl;
                break;
            }
        }

        // Update user on Supabase
        const { error: userError } = await supabase
            .from('users')
            .update({
                current_level: assignedLevel,
                onboarding_completed: true
            })
            .eq('id', userId);

        if (userError) throw userError;

        // Record Placement Result for History/Leaderboard (Fault-tolerant)
        try {
            const { error: resultError } = await supabase
                .from('placement_results')
                .insert([{
                    user_id: userId,
                    score_percentage: parseFloat(scorePercentage.toFixed(2)),
                    assigned_level: assignedLevel
                }]);

            if (resultError) {
                console.warn('Non-fatal: Error saving placement result:', resultError.message);
            }
        } catch (_) { /* non-critical analytics */ }

        // Record XP on Supabase (Fault-tolerant)
        try {
            const { error: xpError } = await supabase
                .from('user_xp_log')
                .insert([{ user_id: userId, action: 'placement_test', points: 50 }]);

            if (xpError) {
                console.warn('Non-fatal: Error saving XP log:', xpError.message);
            }
        } catch (_) { /* non-critical analytics */ }

        res.json({
            message: 'Placement test completed successfully via Supabase',
            assignedLevel,
            scorePercentage: parseFloat(scorePercentage.toFixed(2)),
            scorePerLevel
        });
    } catch (error) {
        console.error('submitTest error:', error);
        res.status(500).json({ message: 'Error processing placement test' });
    }
};

/**
 * Get Placement Leaderboard.
 */
exports.getLeaderboard = async (req, res) => {
    try {
        // Try full query with avatar_url first
        let data, error;
        ({ data, error } = await supabase
            .from('placement_results')
            .select(`
                id,
                score_percentage,
                assigned_level,
                completed_at,
                users (
                    full_name,
                    avatar_url
                )
            `)
            .order('score_percentage', { ascending: false })
            .order('completed_at', { ascending: true })
            .limit(10));

        // If avatar_url column doesn't exist, fallback without it
        if (error && error.code === '42703') {
            console.warn('avatar_url column not found, falling back to basic query');
            ({ data, error } = await supabase
                .from('placement_results')
                .select(`
                    id,
                    score_percentage,
                    assigned_level,
                    completed_at,
                    users (
                        full_name
                    )
                `)
                .order('score_percentage', { ascending: false })
                .order('completed_at', { ascending: true })
                .limit(10));
        }

        if (error) throw error;

        const leaderboard = (data || []).map(item => ({
            id: item.id,
            userName: item.users?.full_name || 'Anonymous Learner',
            avatarUrl: item.users?.avatar_url || null,
            score: item.score_percentage,
            level: item.assigned_level,
            date: item.completed_at
        }));

        res.json(leaderboard);
    } catch (error) {
        console.error('getLeaderboard error:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};
