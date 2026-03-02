import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2, AlertCircle } from 'lucide-react';

const SentenceEvolution = ({ evolutionContent }) => {
    // In a real app this progress comes from the user_progress table
    const [currentStep, setCurrentStep] = useState(1); // Set to 1 to show some progress in preview

    if (!evolutionContent || !Array.isArray(evolutionContent) || evolutionContent.length === 0) {
        return (
            <section className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', marginTop: '1rem' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Evolution Content Available</h3>
                <p>Sentence building phases haven't been generated for this lesson.</p>
            </section>
        );
    }

    const defaultColors = ["#60a5fa", "#34d399", "#fbbf24", "#f43f5e", "#a855f7"];

    const steps = evolutionContent.map((step, idx) => ({
        level: step.level || `Level ${idx + 1}`,
        desc: step.explanation || "Evolution Step",
        exampleId: step.english,
        exampleKn: step.kannada,
        color: defaultColors[idx % defaultColors.length]
    }));

    return (
        <section className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers color="var(--primary)" /> ವಾಕ್ಯ ವಿಕಾಸ (Sentence Evolution)
            </h2>

            {/* Desktop: Horizontal Steps / Mobile: Vertical Stack (handled via media query in index.css if needed, or inline flex-direction) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <style>
                    {`
                        .evolution-container { display: flex; flex-direction: column; gap: 1rem; }
                        @media(min-width: 1024px) {
                            .evolution-container { flex-direction: row; justify-content: space-between; gap: 0.5rem; }
                            .evolution-step { flex: 1; min-width: 0; }
                        }
                    `}
                </style>
                <div className="evolution-container">
                    {steps.map((step, idx) => {
                        // For demonstration, let's unlock all steps if previewing, or base it on progress.
                        // Here we unlock all to easily view the AI content.
                        const isUnlocked = true;
                        const isActive = idx === steps.length - 1; // Highlight the most advanced one or the current step

                        return (
                            <motion.div
                                key={idx}
                                className="evolution-step"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                style={{
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    border: isActive ? `2px solid ${step.color}` : '1px solid var(--border)',
                                    background: isActive ? `${step.color}10` : 'var(--bg-card)',
                                    opacity: isUnlocked ? 1 : 0.5,
                                    filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: step.color, marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                                    {step.level}
                                </div>
                                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', fontWeight: 700 }}>{step.desc}</h3>

                                {isUnlocked && (
                                    <div style={{ marginTop: '0.75rem', padding: '0.5rem', background: 'var(--bg-dark)', borderRadius: '0.5rem', wordBreak: 'break-word' }}>
                                        <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{step.exampleId}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{step.exampleKn}</div>
                                    </div>
                                )}

                                {isUnlocked && !isActive && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                                        <CheckCircle2 color={step.color} size={20} />
                                    </div>
                                )}
                                {!isUnlocked && (
                                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', fontSize: '1.2rem' }}>
                                        🔒
                                    </div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default SentenceEvolution;
