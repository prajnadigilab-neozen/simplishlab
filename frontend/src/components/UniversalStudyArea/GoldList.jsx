import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const GoldList = () => {
    // Dummy Data
    const bridges = [
        { id: 1, kannada: 'ಇಟ್ಟು', english: 'Eat', rule: 'Sounds similar', phraseKn: 'ಊಟ ಇಟ್ಟು (Eat food)' },
        { id: 2, kannada: 'ಗೋಡೆ', english: 'Go', rule: 'Go to the wall', phraseKn: 'ಗೋಡೆ ಹತ್ತಿರ ಹೋಗು (Go near the wall)' },
        { id: 3, kannada: 'ಬಾ', english: 'Come', rule: 'Baa = Come', phraseKn: 'ಒಳಗೆ ಬಾ (Come inside)' }
    ];

    const [flippedStatus, setFlippedStatus] = useState({});

    const handleFlip = (id) => {
        setFlippedStatus(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <section>
            <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles color="#eab308" /> "Gold" List & Mnemonic Bridges
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Tap cards to reveal the memorable English connection.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {bridges.map(bridge => (
                    <div
                        key={bridge.id}
                        onClick={() => handleFlip(bridge.id)}
                        onMouseEnter={() => window.innerWidth > 1024 && setFlippedStatus(prev => ({ ...prev, [bridge.id]: true }))}
                        onMouseLeave={() => window.innerWidth > 1024 && setFlippedStatus(prev => ({ ...prev, [bridge.id]: false }))}
                        className="touch-target"
                        style={{ perspective: '1000px', cursor: 'pointer', minHeight: '160px' }}
                    >
                        <motion.div
                            initial={false}
                            animate={{ rotateY: flippedStatus[bridge.id] ? 180 : 0 }}
                            transition={{ duration: 0.4, type: 'spring', stiffness: 200, damping: 20 }}
                            style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
                        >
                            {/* FRONT OF CARD (Kannada) */}
                            <div className="glass-card" style={{
                                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                background: '#fef3c7', border: '2px solid #fde68a'
                            }}>
                                <h3 style={{ fontSize: '2rem', color: '#92400e', margin: 0 }}>{bridge.kannada}</h3>
                                <div style={{ fontSize: '0.85rem', color: '#b45309', marginTop: '0.5rem', textAlign: 'center' }}>
                                    {bridge.phraseKn}
                                </div>
                            </div>

                            {/* BACK OF CARD (English Bridge) */}
                            <div className="glass-card" style={{
                                position: 'absolute', width: '100%', height: '100%', backfaceVisibility: 'hidden',
                                padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                                background: 'var(--primary)', color: 'white', transform: 'rotateY(180deg)'
                            }}>
                                <h3 style={{ fontSize: '2.5rem', margin: 0, fontWeight: 900 }}>{bridge.english}</h3>
                                <div style={{ fontSize: '0.9rem', opacity: 0.9, marginTop: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.75rem', borderRadius: '1rem' }}>
                                    💡 Bridge: {bridge.rule}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default GoldList;
