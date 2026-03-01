-- Seed Placement Questions for SIMPLISH
-- This script populates the placement_questions table with sample data for testing.

INSERT INTO public.placement_questions (question_text, options, correct_answer, difficulty_level, display_order)
VALUES 
-- Basic Level
('Which of these is a greeting?', '["Goodbye", "Hello", "Apple", "Blue"]', 'Hello', 'Basic', 1),
('Complete the sentence: "I ___ a student."', '["is", "am", "are", "be"]', 'am', 'Basic', 2),

-- Intermediate Level
('What is the past tense of "Go"?', '["Goes", "Going", "Went", "Gone"]', 'Went', 'Intermediate', 1),
('Which sentence is correct?', '["He don''t like coffee", "He doesn''t likes coffee", "He doesn''t like coffee", "He not like coffee"]', 'He doesn''t like coffee', 'Intermediate', 2),

-- Advanced Level
('Choose the correct synonym for "Abundant":', '["Small", "Plentiful", "Rare", "Quick"]', 'Plentiful', 'Advanced', 1),
('Identify the passive voice sentence:', '["She wrote a letter", "The letter was written by her", "Writing a letter is hard", "She is writing a letter"]', 'The letter was written by her', 'Advanced', 2),

-- Expert Level
('What does the idiom "Beat around the bush" mean?', '["To plant a bush", "To avoid the main topic", "To clean the garden", "To hit something"]', 'To avoid the main topic', 'Expert', 1),
('Identify the figure of speech: "The stars danced playfully in the moonlit sky."', '["Metaphor", "Simile", "Personification", "Hyperbole"]', 'Personification', 'Expert', 2);
