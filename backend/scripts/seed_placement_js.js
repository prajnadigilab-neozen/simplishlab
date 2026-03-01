/**
 * Seed Placement Questions into Supabase
 * Usage: node scripts/seed_placement_js.js
 */
require('dotenv').config();
const supabase = require('../config/supabase');

const questions = [
    { question_text: 'Which of these is a greeting?', options: ["Goodbye", "Hello", "Apple", "Blue"], correct_answer: 'Hello', difficulty_level: 'Basic', display_order: 1 },
    { question_text: 'Complete the sentence: "I ___ a student."', options: ["is", "am", "are", "be"], correct_answer: 'am', difficulty_level: 'Basic', display_order: 2 },
    { question_text: 'What is the past tense of "Go"?', options: ["Goes", "Going", "Went", "Gone"], correct_answer: 'Went', difficulty_level: 'Intermediate', display_order: 1 },
    { question_text: 'Which sentence is correct?', options: ["He don't like coffee", "He doesn't likes coffee", "He doesn't like coffee", "He not like coffee"], correct_answer: "He doesn't like coffee", difficulty_level: 'Intermediate', display_order: 2 },
    { question_text: 'Choose the correct synonym for "Abundant":', options: ["Small", "Plentiful", "Rare", "Quick"], correct_answer: 'Plentiful', difficulty_level: 'Advanced', display_order: 1 },
    { question_text: 'Identify the passive voice sentence:', options: ["She wrote a letter", "The letter was written by her", "Writing a letter is hard", "She is writing a letter"], correct_answer: 'The letter was written by her', difficulty_level: 'Advanced', display_order: 2 },
    { question_text: 'What does the idiom "Beat around the bush" mean?', options: ["To plant a bush", "To avoid the main topic", "To clean the garden", "To hit something"], correct_answer: 'To avoid the main topic', difficulty_level: 'Expert', display_order: 1 },
    { question_text: 'Identify the figure of speech: "The stars danced playfully in the moonlit sky."', options: ["Metaphor", "Simile", "Personification", "Hyperbole"], correct_answer: 'Personification', difficulty_level: 'Expert', display_order: 2 },
];

async function seed() {
    console.log(`Seeding ${questions.length} placement questions...`);
    const { error } = await supabase.from('placement_questions').insert(questions);
    if (error) {
        console.error('Seed error:', error.message);
    } else {
        console.log('✅ All placement questions seeded successfully.');
    }
}

seed();
