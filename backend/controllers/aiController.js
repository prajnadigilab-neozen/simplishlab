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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

exports.generateLessonContent = async (req, res) => {
  const { prompt, engine } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ message: 'AI service not configured.' });
  }

  try {
    const modelName = (engine === 'gemini-1.5-pro' || engine === 'gemini-2.5-pro') ? 'gemini-2.5-pro' : 'gemini-2.5-flash';
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        responseMimeType: "application/json",
      }
    });

    const systemPrompt = `You are an expert English teacher for Kannada speakers. Generate a structured English lesson in JSON format based on the following topic or prompt: "${prompt}".
ALL text generated MUST be BILINGUAL (English with Kannada translation). This includes the title and description.

The JSON output MUST STRICTLY follow this schema:
{
  "title": "Bilingual Lesson Title: English Title (ಕನ್ನಡ ಶೀರ್ಷಿಕೆ) (Level)",
  "description": "Bilingual description: English description here (ಕನ್ನಡ ವಿವರಣೆ ಇಲ್ಲಿದೆ).",
  "logicContent": "A readable BILINGUAL text block (English + Kannada). Use newlines for spacing. DO NOT return an array or object here, only a plain string.",
  "evolutionContent": "A readable BILINGUAL text block (English + Kannada). Use newlines for spacing. DO NOT return an array or object here, only a plain string.",
  "readingContent": "A readable BILINGUAL text block (English + Kannada). DO NOT return an array or object here, only a plain string.",
  "listening": {
    "transcription": "Bilingual dialogue or story transcript (English + Kannada)."
  },
  "vocabularyContent": "A readable BILINGUAL list (English word - Kannada translation - Mnemonic). DO NOT return an array or object here, only a plain string.",
  "milestoneTest": [
    {
      "text": "Bilingual Question: Question in English (ಮತ್ತು ಕನ್ನಡ)?",
      "options": ["Option 1 (ಕನ್ನಡ 1)", "Option 2 (ಕನ್ನಡ 2)", "Option 3 (ಕನ್ನಡ 3)", "Option 4 (ಕನ್ನಡ 4)"],
      "correct_answer": "Option 1 (ಕನ್ನಡ 1)",
      "type": "mcq"
    }
  ]
}

Ensure the output is ONLY valid JSON. Include 5 vocabulary words and 3 milestone test questions.`;

    const result = await model.generateContent(systemPrompt);
    let text = result.response.text();

    // Parse the generated JSON
    const generatedJSON = JSON.parse(text);

    res.json({ content: generatedJSON });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ message: 'Error generating lesson content.' });
  }
};
