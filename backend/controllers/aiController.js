/**
 * AI Chat Controller — powered by Google Gemini
 * 
 * Requires GEMINI_API_KEY in backend/.env
 * Add: GEMINI_API_KEY=your_key_here
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.chat = async (req, res) => {
    const { message, lessonContext } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ message: 'Message is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(503).json({ message: 'AI service not configured. Add GEMINI_API_KEY to backend/.env' });
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

        const systemPrompt = `You are SIMPLISH AI, a friendly English language tutor for Kannada-speaking learners in rural Karnataka. 
Your role is to help students learn English simply and effectively.
${lessonContext ? `The student is currently studying: "${lessonContext}".` : ''}

Guidelines:
- Keep responses short (2-4 sentences max) and simple.
- When possible, provide both English and Kannada (ಕನ್ನಡ) explanations.
- Be encouraging and patient.
- Correct grammar gently, never harshly.
- Focus on practical, everyday English.`;

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: systemPrompt }]
                },
                {
                    role: 'model',
                    parts: [{ text: 'ನಮಸ್ಕಾರ! (Hello!) I am your SIMPLISH AI Coach. I am here to help you learn English. Ask me anything!' }]
                }
            ]
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error('AI Chat Error:', error.message);
        res.status(500).json({ message: 'AI service error. Please try again.' });
    }
};
