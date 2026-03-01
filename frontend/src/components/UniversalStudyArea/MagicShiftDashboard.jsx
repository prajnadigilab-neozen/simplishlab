import React from 'react';
import { motion } from 'framer-motion';

const MagicShiftDashboard = () => {
    return (
        <section className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ✨ Magic Shift (ಮ್ಯಾಜಿಕ್ ಶಿಫ್ಟ್)
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                See how Kannada (SOV) transforms into English (SVO).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Kannada SOV */}
                <div style={{ padding: '1.5rem', background: 'var(--bg-dark)', borderRadius: '0.75rem', border: '1px dashed var(--border)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        Kannada Format: SOV
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                        <div style={{ background: '#bfdbfe', color: '#1d4ed8', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ನಾನು (I) <br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Subject</span>
                        </div>
                        <div style={{ background: '#fed7aa', color: '#c2410c', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ಸೇಬು (Apple) <br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Object</span>
                        </div>
                        <div style={{ background: '#bbf7d0', color: '#15803d', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            ತಿನ್ನುತ್ತೇನೆ (Eat) <br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Verb</span>
                        </div>
                    </div>
                </div>

                {/* Shift Animation Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <motion.div
                        animate={{ y: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ fontSize: '2rem', color: 'var(--primary)' }}
                    >
                        ↓
                    </motion.div>
                </div>

                {/* English SVO */}
                <div style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '0.75rem', border: '2px solid var(--primary-light)' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                        English Format: SVO
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                        <motion.div
                            layoutId="subject"
                            style={{ background: '#bfdbfe', color: '#1d4ed8', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            I <br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Subject</span>
                        </motion.div>
                        <motion.div
                            layoutId="verb"
                            initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                            style={{ background: '#bbf7d0', color: '#15803d', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem', boxShadow: '0 4px 15px rgba(21, 128, 61, 0.2)' }}>
                            Eat <br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Verb</span>
                        </motion.div>
                        <motion.div
                            layoutId="object"
                            style={{ background: '#fed7aa', color: '#c2410c', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            Apple <br /><span style={{ fontSize: '0.75rem', opacity: 0.8 }}>Object</span>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MagicShiftDashboard;
