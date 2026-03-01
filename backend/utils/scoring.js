// LOGIC: Assessment Scoring
// 1. MCQ: Exact match between user choice and 'correct_answer'.
// 2. Text: Case-insensitive match or fuzzy matching (can be improved with AI).
// 3. Voice/OCR: In Step 4, these will yield 'transcribedText' or 'extractedText', 
//    which we then compare against the correct answer.

exports.calculateScore = (questions, answers) => {
    let totalPoints = 0;
    let earnedPoints = 0;

    questions.forEach(q => {
        totalPoints += q.points;
        const userAnswer = answers[q.id];

        if (!userAnswer) return;

        const clean = (text) => (text || "").toString().trim().toLowerCase().replace(/[^a-z0-9\u0C80-\u0CFF\s]/gi, "");

        const userClean = clean(userAnswer);
        const correctClean = clean(q.correct_answer);

        if (userClean === correctClean && userClean !== "") {
            earnedPoints += q.points;
        }
    });

    const score = Math.round((earnedPoints / totalPoints) * 100);
    return {
        score,
        passed: score >= 80, // Configurable passing criteria
        earnedPoints,
        totalPoints
    };
};
