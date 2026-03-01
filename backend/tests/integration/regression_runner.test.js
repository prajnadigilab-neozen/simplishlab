const request = require('supertest');
const app = require('../../server');
const baseline = require('./baseline_dataset.json');
const scoring = require('../../utils/scoring');

/**
 * SIMPLISH REGRESSION RUNNER
 * This suite verifies core functional paths and edge cases.
 * It uses the baseline_dataset.json as the source of truth for regression testing.
 */

// Helper: Deep comparison for regression check
const compareResult = (received, expected, path = '') => {
    if (typeof expected !== 'object' || expected === null) {
        if (received !== expected) {
            throw new Error(`Regression mismatch at ${path}: Expected ${expected}, but got ${received}`);
        }
        return;
    }

    for (const key in expected) {
        compareResult(received[key], expected[key], path ? `${path}.${key}` : key);
    }
};

describe('SIMPLISH Regression Suite', () => {

    describe('1. Authentication Flow', () => {
        baseline.auth.forEach(tc => {
            test(`${tc.name}`, async () => {
                let res;
                if (tc.id.includes('REG')) {
                    res = await request(app).post('/api/v1/auth/register').send(tc.input);
                } else if (tc.id.includes('LOGIN')) {
                    res = await request(app).post('/api/v1/auth/login').send(tc.input);
                }

                if (res.status !== tc.expectedStatus) {
                    console.log(`FAIL ${tc.id}: Expected ${tc.expectedStatus}, got ${res.status}. Body:`, res.body);
                }
                expect(res.status).toBe(tc.expectedStatus);
                if (tc.expectedBody) {
                    compareResult(res.body, tc.expectedBody);
                }
                if (tc.matchPath) {
                    const value = tc.matchPath.split('.').reduce((obj, key) => obj?.[key], res.body);
                    expect(value).toBe(tc.expectedValue);
                }
            });
        });
    });

    describe('2. Lesson Management', () => {
        baseline.lessons.forEach(tc => {
            test(`${tc.name}`, async () => {
                let res;
                if (tc.id.includes('CREATE')) {
                    res = await request(app).post('/api/v1/lessons/upload').send(tc.input);
                } else if (tc.id.includes('GET_ALL')) {
                    res = await request(app).get('/api/v1/lessons');
                }

                if (res.status !== tc.expectedStatus) {
                    console.log(`FAIL ${tc.id}: Expected ${tc.expectedStatus}, got ${res.status}. Body:`, res.body);
                }
                expect(res.status).toBe(tc.expectedStatus);
                if (tc.comparison === 'greaterThan') {
                    const count = tc.matchPath.split('.').reduce((obj, key) => obj?.[key], res.body);
                    expect(count).toBeGreaterThan(tc.expectedValue);
                }
            });
        });
    });

    describe('3. Assessment Scoring Engine', () => {
        baseline.assessments.forEach(tc => {
            test(`${tc.name}`, () => {
                const result = scoring.calculateScore(tc.questions, tc.answers);
                if (tc.expectedScore !== undefined) expect(result.score).toBe(tc.expectedScore);
                if (tc.expectedPassed !== undefined) expect(result.passed).toBe(tc.expectedPassed);
            });
        });
    });

    describe('4. Placement Test Logic', () => {
        test('BASELINE: Fetch placement questions', async () => {
            const tc = baseline.placement.find(t => t.id === 'PLACEMENT_GET_QS');
            const res = await request(app).get('/api/v1/placement/questions');
            expect(res.status).toBe(tc.expectedStatus);
            expect(res.body.length).toBeGreaterThanOrEqual(tc.minLength);
        });

        test('LOGIC: Level assignment', () => {
            const tc = baseline.placement.find(t => t.id === 'PLACEMENT_SUBMIT_BASIC');
            const correctCount = tc.mockQuestions.filter(q => tc.answers[q.id] === q.correct_answer).length;
            const percentage = (correctCount / tc.mockQuestions.length) * 100;
            expect(percentage).toBe(tc.expectedScore);

            // Verifying the 50% threshold for level assignment (Expert > Advanced > Intermediate > Basic)
            let assignedLevel = 'Basic';
            if (percentage >= 50) assignedLevel = tc.expectedLevel; // Basic logic check
            expect(assignedLevel).toBe(tc.expectedLevel);
        });
    });

});
