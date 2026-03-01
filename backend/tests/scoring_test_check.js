const scoring = require('../utils/scoring');

function testScoring() {
    console.log("Starting Scoring Tests...");

    const questions = [
        { id: '1', question_type: 'MCQ', correct_answer: 'Blue', points: 10 },
        { id: '2', question_type: 'Voice', correct_answer: 'Hello', points: 20 },
        { id: '3', question_type: 'Image', correct_answer: 'Success', points: 20 }
    ];

    const testCases = [
        {
            name: "All Correct",
            answers: { '1': 'Blue', '2': 'Hello', '3': 'Success' },
            expectedScore: 100,
            expectedPassed: true
        },
        {
            name: "Partial Correct (MCQ and Voice)",
            answers: { '1': 'Blue', '2': 'hello', '3': 'Failure' }, // 'hello' should match 'Hello' due to toLowerCase()
            expectedScore: 60, // (10 + 20) / 50 = 60%
            expectedPassed: false
        },
        {
            name: "Case Insensitive & Trim",
            answers: { '1': 'Blue', '2': '  hElLo  ', '3': 'SUCCESS' },
            expectedScore: 100,
            expectedPassed: true
        }
    ];

    testCases.forEach(tc => {
        const result = scoring.calculateScore(questions, tc.answers);
        const pass = result.score === tc.expectedScore && result.passed === tc.expectedPassed;
        console.log(`${pass ? '✅' : '❌'} [${tc.name}]: Got ${result.score}%, Expected ${tc.expectedScore}%`);
        if (!pass) {
            console.log("  Details:", result);
        }
    });
}

testScoring();
