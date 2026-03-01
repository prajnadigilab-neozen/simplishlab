-- Seed Questions for SIMPLISH LMS
-- Target Lesson: Debug Lesson (2232861b-2747-47d4-a8b4-68e766b772e7)

DO $$
DECLARE
    v_lesson_id UUID := '2232861b-2747-47d4-a8b4-68e766b772e7';
    v_assessment_id UUID;
BEGIN
    -- 1. Create Assessment
    INSERT INTO assessments (lesson_id, title, passing_score)
    VALUES (v_lesson_id, 'Lesson Assessment', 80)
    ON CONFLICT (lesson_id) DO UPDATE SET title = EXCLUDED.title
    RETURNING id INTO v_assessment_id;

    -- 2. Clear old questions for this assessment
    DELETE FROM questions WHERE assessment_id = v_assessment_id;

    -- 3. Add MCQ Question
    INSERT INTO questions (assessment_id, question_text, question_type, options, correct_answer, points)
    VALUES (v_assessment_id, 'What is the color of the sky?', 'MCQ', '["Blue", "Red", "Green", "Yellow"]'::jsonb, 'Blue', 10);

    -- 4. Add Voice Question
    INSERT INTO questions (assessment_id, question_text, question_type, correct_answer, points)
    VALUES (v_assessment_id, 'Say "Hello" in English.', 'Voice', 'Hello', 20);

    -- 5. Add Image/OCR Question
    INSERT INTO questions (assessment_id, question_text, question_type, correct_answer, points)
    VALUES (v_assessment_id, 'Upload an image with the word "Success" written on it.', 'Image', 'Success', 20);

    RAISE NOTICE 'Seeded assessment and questions for lesson %', v_lesson_id;
END $$;
