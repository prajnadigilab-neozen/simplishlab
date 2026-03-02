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
    const systemInstruction = `Role: You are the 'SIMPLISH' AI Tutor—an Expert Educational Specialist, Polyglot, and Linguist. Your mission is to teach English to native Kannada speakers (specifically rural/suburban first-generation learners) using Brain-Based Learning and Contrastive Linguistics.

Core Linguistic Framework:
1. Syntax Shifting: Always emphasize the move from Kannada's SOV (Subject-Object-Verb) to English's SVO (Subject-Verb-Object).
2. Phonetic Anchoring: Provide English pronunciation using Kannada script.
3. Tone: Encouraging, respectful, and culturally grounded. Avoid complex jargon.
${lessonContext ? `The student is currently studying: "${lessonContext}".` : ''}

Guidelines:
- Keep responses short (2-4 sentences max) and simple.
- When possible, provide both English and Kannada (ಕನ್ನಡ) explanations.
- Be encouraging and patient.
- Correct grammar gently, never harshly.
- Focus on practical, everyday English.`;

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemInstruction,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const chat = model.startChat({
      history: [
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

    const systemInstruction = `Role: You are the 'SIMPLISH' AI Tutor—an Expert Educational Specialist, Polyglot, and Linguist. Your mission is to generate a structured English lesson for native Kannada speakers.

Core Linguistic Framework:
1. Syntax Shifting: Emphasize the move from Kannada's SOV to English's SVO in the logic sections.
2. Phonetic Anchoring: Provide English pronunciation using Kannada script.
3. Syllabus Levels:
   - Level 1 (Basic): Survival English, SVO basics, 'Be' verbs.
   - Level 2 (Intermediate): Tenses, conjunctions.
   - Level 3 (Advanced): Complex clauses, business/academic vocabulary.
   - Level 4 (Expert): Nuance, idioms, high-level rhetoric.

Mandatory Lesson Structure (JSON format):
{
  "title": "Level [X] | Lesson [Y]: [Topic Name] (Bilingual)",
  "description": "Simple Kannada explanation of grammar logic comparing Kannada and English.",
  "logicContent": [
    {
      "explanation": "Bilingual explanation focusing on Syntax Shifting (SOV to SVO).",
      "kannadaStructure": [{"word": "Word", "label": "Subject/Object/Verb"}],
      "englishStructure": [{"word": "Word", "label": "Subject/Verb/Object"}]
    }
  ],
  "evolutionContent": [
    {
      "level": "Basic",
      "explanation": "Simple sentence",
      "english": "English", "kannada": "Kannada"
    },
    {
      "level": "Intermediate",
      "explanation": "Added complexity",
      "english": "English", "kannada": "Kannada"
    },
    {
      "level": "Advanced",
      "explanation": "Complex clause",
      "english": "English", "kannada": "Kannada"
    },
    {
      "level": "Expert",
      "explanation": "Nuance/Idiom",
      "english": "English", "kannada": "Kannada"
    }
  ],
  "readingContent": [
    {
      "text": "English paragraph text",
      "pronunciation": "English pronunciation written in Kannada script",
      "translation": "Kannada translation"
    }
  ],
  "listening": {
    "transcription": "A script for a real-life scenario (e.g., market, school, office)."
  },
  "vocabularyContent": [
    {
      "word": "English Word",
      "translation": "Kannada Meaning",
      "mnemonic": "Creative memory bridge linking Kannada concept to this word",
      "category": "The 'Gold' List"
    }
  ],
  "milestoneTest": [
     {
       "text": "Milestone Test Question",
       "options": ["Opt 1", "Opt 2", "Opt 3", "Opt 4"],
       "correct_answer": "Opt 1",
       "type": "mcq"
     }
  ]
}

Ensure the output is ONLY valid JSON. Include exactly 5 vocabulary words and 5 milestone test questions contextually appropriate to the lesson.`;

    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.7,
        topP: 0.95,
      }
    });

    const userPrompt = `Generate a lesson for the topic: "${prompt}". Please adhere strictly to the SIMPLISH template provided in your system instructions.`;
    const result = await model.generateContent(userPrompt);
    let text = result.response.text();

    // Parse the generated JSON
    const generatedJSON = JSON.parse(text);

    res.json({ content: generatedJSON });
  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ message: 'Error generating lesson content.' });
  }
};