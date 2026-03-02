const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: './backend/.env' });

(async () => {
    try {
        console.log('Testing Gemini Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Missing');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: 'application/json' } });
        const res = await model.generateContent('Generate a JSON object with a single key \"hello\".');
        console.log(res.response.text());
    } catch (err) {
        console.error('TEST ERROR:', err);
    }
})();
