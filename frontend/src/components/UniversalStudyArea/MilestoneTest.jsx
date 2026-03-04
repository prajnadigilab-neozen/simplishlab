import React, { useState } from 'react';
import { Target, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { useToast } from '../Toast';
import { lessonApi } from '../../utils/api';

const MilestoneTest = ({ testContent, lessonId, onComplete }) => {
    const showToast = useToast();
    const [userAnswers, setUserAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    if (!testContent || !Array.isArray(testContent) || testContent.length === 0) {
        return (
            <section className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Test Content Available</h3>
                <p>There are no milestone questions configured for this lesson.</p>
            </section>
        );
    }

    const handleOptionSelect = (qIndex, option) => {
        if (submitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [qIndex]: option
        }));
    };

    const handleTextChange = (qIndex, text) => {
        if (submitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [qIndex]: text
        }));
    };

    const calculateScore = async () => {
        let correctCount = 0;
        testContent.forEach((q, idx) => {
            const userAnswer = userAnswers[idx] || '';
            if (q.options && q.options.length > 0) {
                // MCQ
                if (userAnswer === q.correct_answer) correctCount++;
            } else {
                // Text Translation
                if (userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
                    correctCount++;
                }
            }
        });

        const finalScore = Math.round((correctCount / testContent.length) * 100);
        setScore(finalScore);
        setSubmitted(true);

        if (lessonId) {
            try {
                // Always save score, but only set completed status if passed
                const isPassed = finalScore >= 70;
                await lessonApi.updateProgress(lessonId, {
                    status: isPassed ? 'completed' : 'started',
                    score: finalScore,
                    completionPercentage: isPassed ? 100 : 50 // Use 50% as a proxy for "started with attempt"
                });
                if (isPassed && onComplete) onComplete();
            } catch (err) {
                console.error("Failed to update test score to backend:", err);
            }
        }

        if (finalScore >= 70) {
            showToast(`ಆಹಾ! ಅದ್ಭುತ! (Great job!) You scored ${finalScore}%`, 'success');
        } else {
            showToast(`You scored ${finalScore}%. Keep practicing!`, 'error');
        }
    };

    const resetTest = () => {
        setUserAnswers({});
        setSubmitted(false);
        setScore(0);
    };

    return (
        <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 0.25rem 0' }}>
                        <Target color="#ef4444" /> ಮೈಲಿಗಲ್ಲು ಪರೀಕ್ಷೆ (Milestone Test)
                    </h2>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Validate your progress through interactive challenges.</p>
                </div>
                {submitted && (
                    <button onClick={resetTest} className="btn" style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)' }}>
                        <RefreshCw size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Retry Test
                    </button>
                )}
            </div>

            {submitted && (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: score >= 70 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `2px solid ${score >= 70 ? '#10b981' : '#ef4444'}` }}>
                    <h3 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0', color: score >= 70 ? '#10b981' : '#ef4444' }}>
                        {score}%
                    </h3>
                    <p style={{ margin: 0, fontWeight: 600 }}>
                        {score >= 70 ? 'Milestone Cleared! Points added to your profile.' : 'Don\'t give up! Review the material and try again.'}
                    </p>
                </div>
            )}

            {testContent.map((q, idx) => {
                const isMCQ = q.options && q.options.length > 0;
                const userAnswer = userAnswers[idx] || '';
                const isCorrect = isMCQ
                    ? userAnswer === q.correct_answer
                    : userAnswer.trim().toLowerCase() === q.correct_answer.trim().toLowerCase();

                let cardStyle = { padding: '1.5rem', border: '1px solid var(--border)' };
                if (submitted) {
                    cardStyle.border = isCorrect ? '2px solid #10b981' : '2px solid #ef4444';
                    cardStyle.background = isCorrect ? 'rgba(16, 185, 129, 0.05)' : 'rgba(239, 68, 68, 0.05)';
                }

                return (
                    <div key={idx} className="glass-card" style={cardStyle}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', lineHeight: '1.5' }}>
                            <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>Q{idx + 1}.</span> {q.text}
                        </h3>

                        {isMCQ ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {(Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? q.options.split(',').map(o => o.trim()) : [])).map((option, optIdx) => {
                                    const isSelected = userAnswer === option;
                                    const isCorrectOption = option === q.correct_answer;

                                    let optionStyle = {
                                        display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                                        borderRadius: '0.5rem', background: isSelected ? 'var(--primary-light)' : 'var(--bg-card)',
                                        cursor: submitted ? 'default' : 'pointer', transition: 'all 0.2s', opacity: (submitted && !isSelected && !isCorrectOption) ? 0.6 : 1
                                    };

                                    if (submitted) {
                                        if (isCorrectOption) {
                                            optionStyle.border = '2px solid #10b981';
                                            optionStyle.background = 'rgba(16, 185, 129, 0.1)';
                                        } else if (isSelected && !isCorrectOption) {
                                            optionStyle.border = '2px solid #ef4444';
                                            optionStyle.background = 'rgba(239, 68, 68, 0.1)';
                                        }
                                    }

                                    return (
                                        <label key={optIdx} className="touch-target" style={optionStyle}>
                                            <input
                                                type="radio"
                                                name={`q_${idx}`}
                                                value={option}
                                                checked={isSelected}
                                                onChange={() => handleOptionSelect(idx, option)}
                                                disabled={submitted}
                                                style={{ width: '20px', height: '20px', accentColor: submitted ? (isCorrectOption ? '#10b981' : '#ef4444') : 'var(--primary)' }}
                                            />
                                            <span style={{ fontSize: '1.1rem', fontWeight: isSelected ? 700 : 500 }}>{option}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        ) : (
                            <div>
                                <textarea
                                    value={userAnswer}
                                    onChange={(e) => handleTextChange(idx, e.target.value)}
                                    disabled={submitted}
                                    placeholder="Type your translation/answer here..."
                                    style={{ width: '100%', minHeight: '80px', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-main)', resize: 'vertical', fontSize: '1rem' }}
                                />
                                {submitted && !isCorrect && (
                                    <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderRadius: '0.5rem', fontWeight: 600 }}>
                                        Correct Answer: {q.correct_answer}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            {!submitted && (
                <button
                    className="btn btn-primary touch-target"
                    style={{ width: '100%', padding: '1.25rem', fontSize: '1.1rem', marginTop: '1rem', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
                    onClick={calculateScore}
                    disabled={Object.keys(userAnswers).length !== testContent.length}
                >
                    <CheckCircle2 size={24} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} /> Submit Answers
                </button>
            )}
        </section>
    );
};

export default MilestoneTest;
