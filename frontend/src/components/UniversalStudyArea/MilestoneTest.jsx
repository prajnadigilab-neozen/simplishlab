import React, { useState } from 'react';
import { Target, CheckCircle2, RotateCcw } from 'lucide-react';
import { useToast } from '../Toast';

const MilestoneTest = () => {
    // Dummy Part A: SVO Sorting
    const originalWords = [
        { id: '1', text: 'Apple' },
        { id: '2', text: 'I' },
        { id: '3', text: 'Eat' }
    ];
    // Correct order: I Eat Apple -> 2, 3, 1

    const [availableWords, setAvailableWords] = useState(originalWords);
    const [selectedWords, setSelectedWords] = useState([]);

    // Part B: Translation expanding area
    const [translationText, setTranslationText] = useState("");

    // Part C: Radio Select
    const [selectedRadio, setSelectedRadio] = useState(null);

    const showToast = useToast();

    // Tap-to-Order Logic
    const handleWordSelect = (word) => {
        if (!selectedWords.find(w => w.id === word.id)) {
            setSelectedWords([...selectedWords, word]);
            setAvailableWords(availableWords.filter(w => w.id !== word.id));
        }
    };

    const handleWordRemove = (word) => {
        setSelectedWords(selectedWords.filter(w => w.id !== word.id));
        setAvailableWords([...availableWords, word]);
    };

    const resetOrder = () => {
        setAvailableWords(originalWords);
        setSelectedWords([]);
    };

    const checkPartA = () => {
        const order = selectedWords.map(w => w.id).join('');
        if (order === '231') {
            showToast("ಸರಿಯಾಗಿದೆ! (Correct!) - I Eat Apple", 'success');
        } else {
            showToast("ತಪ್ಪಾಗಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. (Incorrect. Try again.)", 'error');
        }
    };

    return (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target color="#ef4444" /> ಮೈಲಿಗಲ್ಲು ಪರೀಕ್ಷೆ (Milestone Test)
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Validate your progress through interactive challenges.</p>
            </div>

            {/* PART A: Tap to Order (SVO Sorter) */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Part A: Construct the Sentence</h3>
                    <button onClick={resetOrder} className="touch-target" style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>
                <p style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem' }}>Translate: "ನಾನು ಸೇಬು ತಿನ್ನುತ್ತೇನೆ"</p>

                {/* Construction Zone */}
                <div style={{ minHeight: '60px', border: '2px dashed var(--border)', borderRadius: '0.5rem', padding: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem', background: 'var(--bg-dark)' }}>
                    {selectedWords.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', alignSelf: 'center' }}>Tap words below to arrange them here...</span>}
                    {selectedWords.map((w, idx) => (
                        <button
                            key={w.id}
                            onClick={() => handleWordRemove(w)}
                            className="touch-target"
                            style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                            {w.text} <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', opacity: 0.7 }}>✕</span>
                        </button>
                    ))}
                </div>

                {/* Available Pool */}
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                    {availableWords.map(w => (
                        <button
                            key={w.id}
                            onClick={() => handleWordSelect(w)}
                            className="touch-target"
                            style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: 600, cursor: 'pointer' }}>
                            {w.text}
                        </button>
                    ))}
                </div>

                <button
                    className="btn btn-primary touch-target"
                    style={{ width: '100%' }}
                    onClick={checkPartA}
                    disabled={selectedWords.length !== 3}
                >
                    <CheckCircle2 size={18} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Check Answer
                </button>
            </div>

            {/* PART B: Expanding Text Area */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Part B: Translation Area</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Translate "ನಾನು ಪ್ರತಿದಿನ ಇಂಗ್ಲಿಷ್ ಕಲಿಯುತ್ತೇನೆ" into English:</p>
                <textarea
                    value={translationText}
                    onChange={(e) => {
                        setTranslationText(e.target.value);
                        e.target.style.height = 'inherit';
                        e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    placeholder="Type your translation here..."
                    style={{ width: '100%', minHeight: '60px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-main)', resize: 'none', overflow: 'hidden', fontSize: '1rem', lineHeight: '1.5' }}
                />
            </div>

            {/* PART C: Large Radio Buttons */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Part C: Vocabulary Check</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>What is the English word for "ಗೋಡೆ"?</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {['Go', 'Wall', 'Walk', 'Water'].map((option, idx) => (
                        <label
                            key={idx}
                            className="touch-target"
                            style={{
                                display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                border: selectedRadio === option ? '2px solid var(--primary)' : '1px solid var(--border)',
                                borderRadius: '0.5rem', background: selectedRadio === option ? 'var(--primary-light)' : 'var(--bg-card)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <input
                                type="radio"
                                name="vocab_mcq"
                                value={option}
                                checked={selectedRadio === option}
                                onChange={() => setSelectedRadio(option)}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }}
                            />
                            <span style={{ fontSize: '1.1rem', fontWeight: selectedRadio === option ? 700 : 500 }}>{option}</span>
                        </label>
                    ))}
                </div>
            </div>

        </section>
    );
};

export default MilestoneTest;
