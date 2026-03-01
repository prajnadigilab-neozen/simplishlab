require('dotenv').config();
const axios = require('axios');

async function testUpsertQuestions() {
    try {
        const response = await axios.post('http://localhost:5000/api/v1/assessments/lesson/test-lesson-id-123/questions', {
            title: 'Test Assessment',
            questions: [
                {
                    text: 'Test question 1',
                    type: 'Text',
                    correct_answer: 'Answer 1',
                    points: 10,
                    explanation: 'Expl 1'
                }
            ]
        }, {
            headers: {
                // If the route expects an auth token or is open, we need to pass headers.
                // Let's check assessment routes
            }
        });
        console.log("Success:", response.data);
    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testUpsertQuestions();
