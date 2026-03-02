import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, Quote } from 'lucide-react';

const ReadingLab = ({ readingContent }) => {
    if (!readingContent || !Array.isArray(readingContent) || readingContent.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Reading Content Available</h3>
                <p>This lesson does not contain a reading lab section.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '4px solid #3b82f6' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}>
                    <BookOpen size={20} /> Reading Lab (ಓದುವ ಪ್ರಯೋಗಾಲಯ)
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Read the English text, follow the Kannada pronunciation, and understand the meaning.
                </p>
            </div>

            <div style={{ display: 'grid', gap: '1.5rem' }}>
                {readingContent.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card"
                        style={{ padding: '1.5rem', border: '1px solid var(--border)' }}
                    >
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                            <div style={{ color: 'var(--primary)', marginTop: '0.2rem' }}>
                                <Quote size={24} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.75rem', lineHeight: '1.6' }}>
                                    {item.text}
                                </p>

                                {item.pronunciation && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.75rem', background: 'var(--bg-dark)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>
                                            Pronunciation (ಉಚ್ಚಾರಣೆ)
                                        </span>
                                        <p style={{ margin: 0, color: '#fbbf24', fontSize: '1.05rem' }}>
                                            {item.pronunciation}
                                        </p>
                                    </div>
                                )}

                                {item.translation && (
                                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.1)' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#10b981', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', marginBottom: '0.25rem' }}>
                                            Meaning (ಅರ್ಥ)
                                        </span>
                                        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '1rem' }}>
                                            {item.translation}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ReadingLab;
