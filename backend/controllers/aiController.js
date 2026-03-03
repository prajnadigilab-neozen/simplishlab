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
  "course_metadata": {
    "platform": "SIMPLISH",
    "level": 1,
    "lesson_number": 3,
    "topic": "Topic Name",
    "language_pair": "Kannada to English",
    "engine_target": "gemini-2.5-flash"
  },
  "lesson_content": {
    "explanation": {
      "kannada": "Grammar rule in Kannada",
      "english_logic": "Grammar rule logic in English"
    },
    "sentence_evolution": [
      {
        "stage": "Basic/Intermediate/Advanced/Expert",
        "english": "Sentence in English",
        "kannada": "Sentence in Kannada"
      }
    ],
    "reading_lab": {
      "text": "English paragraph",
      "phonetic_kannada": "Pronunciation in Kannada"
    },
    "listening_lab": {
      "scenario": "Market/Office conversation",
      "script": [
        {"speaker": "Name", "en": "English line", "kn": "Kannada line"}
      ]
    },
    "retention_block": {
      "gold_list": [
        {"word": "Word", "kn": "Meaning", "pronunciation": "Phonetic"}
      ],
      "mnemonic_bridge": {
        "concept": "Concept link",
        "logic": "Memory trick"
      },
      "srs_cue": {
        "review_24h": "Task",
        "review_7d": "Task",
        "review_30d": "Task"
      }
    },
    "milestone_test": [
      {
        "id": 1,
        "question": "Question text",
        "options": ["A", "B", "C", "D"],
        "correct_answer": "Answer",
        "explanation": "Why?"
      }
    ]
  }
}

Ensure the output is ONLY valid JSON. Include exactly 4 evolution stages, 5 gold words, and 5 milestone test questions contextual to the lesson. Use the exact key names as shown above.`;

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