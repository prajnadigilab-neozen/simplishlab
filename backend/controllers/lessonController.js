const supabase = require('../config/supabase');
const mediaService = require('../services/mediaService');
const fs = require('fs');
const path = require('path');

exports.uploadLesson = async (req, res) => {
    const { title, description, level, displayOrder } = req.body;

    const pdfUrl = req.files?.pdf ? `/uploads/${req.files.pdf[0].filename}` : req.body.pdfUrl || null;
    const audioUrl = req.files?.audio ? `/uploads/${req.files.audio[0].filename}` : req.body.audioUrl || null;
    const videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : req.body.videoUrl || null;

    if (!title || !level) {
        return res.status(400).json({ message: 'Title and level are strictly required.' });
    }

    try {
        const { data, error } = await supabase
            .from('lessons')
            .insert([{
                title,
                description,
                level,
                media_type: 'mixed', // Deprecated but setting to "mixed" in case something depends on it
                media_url: pdfUrl || audioUrl || videoUrl, // Fallback for backwards compatibility
                pdf_url: pdfUrl,
                audio_url: audioUrl,
                video_url: videoUrl,
                display_order: parseInt(displayOrder) || 0
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Lesson created successfully on Supabase',
            lesson: data
        });
    } catch (error) {
        console.error("Lesson Upload Error:", error);
        res.status(500).json({ message: 'Error creating lesson' });
    }
};

exports.getAllLessons = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);
        const offset = parseInt(req.query.offset) || 0;

        const { data, error, count } = await supabase
            .from('lessons')
            .select('*', { count: 'exact' })
            .order('display_order', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) throw error;

        res.json({
            lessons: data,
            total: count,
            limit,
            offset
        });
    } catch (error) {
        console.error('getAllLessons error:', error);
        res.status(500).json({ message: 'Error fetching lessons' });
    }
};

exports.getMyLessonsProgress = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // 1. Fetch all active lessons ordered by display_order
        const { data: lessons, error: lessonsError } = await supabase
            .from('lessons')
            .select('*')
            .order('display_order', { ascending: true });

        if (lessonsError) throw lessonsError;

        // 2. Fetch user progress
        const { data: progressList, error: progressError } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', userId);

        if (progressError) throw progressError;

        // 3. Fetch all assessments to link lessons to results
        const { data: allAssessments, error: asError } = await supabase
            .from('assessments')
            .select('id, lesson_id');

        if (asError) throw asError;

        // 4. Fetch assessment results
        const { data: assessmentResults, error: assessmentError } = await supabase
            .from('assessment_results')
            .select('*')
            .eq('user_id', userId);

        if (assessmentError) throw assessmentError;

        const lList = lessons || [];
        const pList = progressList || [];
        const aList = allAssessments || [];
        const aResults = assessmentResults || [];

        console.log(`[Dashboard] Found ${lList.length} lessons, ${pList.length} progress records, ${aResults.length} assessment results.`);

        // 5. Map everything together
        const enhancedLessons = lList.map(lesson => {
            const up = pList.find(p => p.lesson_id === lesson.id);

            // Find assessment for this lesson
            const assessmentForLesson = aList.find(a => a.lesson_id === lesson.id);

            // Find results for this assessment
            const ar = assessmentForLesson
                ? aResults.filter(a => a.assessment_id === assessmentForLesson.id)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                : null;

            return {
                ...lesson,
                progress: up ? up.completion_percentage : 0,
                status: up ? up.status : 'not_started',
                score: ar ? ar.score : null,
                passed: ar ? ar.passed : null
            };
        });

        res.json({ lessons: enhancedLessons });
    } catch (error) {
        console.error('getMyLessonsProgress error details:', error);
        res.status(500).json({
            message: 'Error fetching user progress for lessons',
            error: error.message || 'Unknown'
        });
    }
};

exports.updateLesson = async (req, res) => {
    const { id } = req.params;
    const { title, description, level, displayOrder } = req.body;

    console.log(`--- Update Lesson Attempt ---`);
    console.log(`ID: ${id}`);
    console.log(`Body:`, req.body);

    let pdfUrl = req.files?.pdf ? `/uploads/${req.files.pdf[0].filename}` : req.body.pdfUrl;
    let audioUrl = req.files?.audio ? `/uploads/${req.files.audio[0].filename}` : req.body.audioUrl;
    let videoUrl = req.files?.video ? `/uploads/${req.files.video[0].filename}` : req.body.videoUrl;

    if (pdfUrl === 'undefined' || pdfUrl === '') pdfUrl = null;
    if (audioUrl === 'undefined' || audioUrl === '') audioUrl = null;
    if (videoUrl === 'undefined' || videoUrl === '') videoUrl = null;

    try {
        const updatePayload = {
            title,
            description,
            level,
            display_order: parseInt(displayOrder) || 0
        };

        if (pdfUrl !== undefined) updatePayload.pdf_url = pdfUrl;
        if (audioUrl !== undefined) updatePayload.audio_url = audioUrl;
        if (videoUrl !== undefined) updatePayload.video_url = videoUrl;

        console.log(`Payload for Supabase:`, updatePayload);

        const { data, error } = await supabase
            .from('lessons')
            .update(updatePayload)
            .eq('id', id)
            .select()
            .maybeSingle();

        if (error) {
            console.error('Supabase Update Error Object:', error);
            throw error;
        }

        if (!data) {
            console.warn(`Lesson with ID ${id} not found for update.`);
            return res.status(404).json({ message: 'Lesson not found' });
        }

        console.log('Update Successful. Returning updated lesson.');
        res.json({ message: 'Lesson updated successfully', lesson: data });
    } catch (error) {
        console.error("Critical Update Controller Error:", error);
        res.status(500).json({
            message: 'Error updating lesson',
            details: error.message || error.details || 'Unknown database error'
        });
    }
};

exports.deleteLesson = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Get lesson to find media path
        const { data: lesson, error: fetchError } = await supabase
            .from('lessons')
            .select('media_url')
            .eq('id', id)
            .single();

        if (fetchError || !lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const mediaPath = lesson.media_url;

        // 2. Delete from Supabase
        const { error: deleteError } = await supabase
            .from('lessons')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        // 3. Delete file from storage via MediaService
        if (mediaPath) {
            await mediaService.deleteFile(mediaPath);
        }

        res.json({ message: 'Lesson deleted successfully from Supabase' });
    } catch (error) {
        console.error("Delete Error:", error);
        res.status(500).json({ message: 'Error deleting lesson' });
    }
};

exports.updateProgress = async (req, res) => {
    const userId = req.user?.id;
    const { lessonId } = req.params;
    const { spentTimeMs, status, completionPercentage, lastActiveTab } = req.body;

    try {
        const payload = {
            user_id: userId,
            lesson_id: lessonId,
            spent_time_ms: spentTimeMs,
            status: status || 'started',
            completion_percentage: completionPercentage || 0
        };

        if (lastActiveTab) {
            payload.last_active_tab = lastActiveTab;
        }

        const { data, error } = await supabase
            .from('user_progress')
            .upsert(payload, { onConflict: 'user_id,lesson_id' })
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'Progress updated', progress: data });
    } catch (error) {
        console.error('updateProgress error full details:', error);
        res.status(500).json({ message: 'Error updating progress', error: error.message || error.details || error.hint || error });
    }
};
