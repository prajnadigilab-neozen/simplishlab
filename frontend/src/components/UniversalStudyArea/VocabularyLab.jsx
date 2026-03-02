import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, AlertCircle, Brain } from 'lucide-react';

const VocabularyLab = ({ vocabularyContent }) => {
    if (!vocabularyContent || !Array.isArray(vocabularyContent) || vocabularyContent.length === 0) {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Vocabulary Available</h3>
                <p>This lesson does not contain a vocabulary section.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #f59e0b' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                    <Sparkles size={20} /> Vocabulary (ಶಬ್ದಕೋಶ) & Mnemonics
                </h3>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Learn new words easily through Kannada bridges and memory cues.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem' }}>
                {vocabularyContent.map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="glass-card"
                        style={{ padding: '1.5rem', border: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}
                    >
                        {item.category && (
                            <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: '#fff', fontSize: '0.65rem', padding: '0.2rem 0.6rem', borderBottomLeftRadius: '8px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                                {item.category}
                            </div>
                        )}

                        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.4rem', color: 'var(--text-main)' }}>
                                {item.word}
                            </h4>
                            <p style={{ margin: 0, color: '#10b981', fontSize: '1.1rem', fontWeight: 500 }}>
                                {item.translation}
                            </p>
                        </div>

                        {item.mnemonic && (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ color: '#fbbf24', marginTop: '0.1rem' }}>
                                    <Brain size={18} />
                                </div>
                                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                                    <span style={{ fontWeight: 600, color: '#fbbf24' }}>Mnemonic Bridge: </span>
                                    {item.mnemonic}
                                </p>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default VocabularyLab;
