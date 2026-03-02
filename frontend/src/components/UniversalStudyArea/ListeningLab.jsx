import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, AlertCircle, PlayCircle } from 'lucide-react';

const ListeningLab = ({ transcription, audioUrl }) => {
    if (!transcription && !audioUrl) {
        return (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3>No Listening Content Available</h3>
                <p>This lesson does not contain an audio track or transcription.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {audioUrl ? (
                <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.05))', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <motion.div
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)', marginBottom: '1.5rem' }}
                    >
                        <Headphones size={36} color="white" />
                    </motion.div>
                    <h3 style={{ margin: '0 0 1.5rem 0', fontSize: '1.4rem' }}>ಲಿಸನ್ & ಲರ್ನ್ (Listen & Learn)</h3>
                    <audio controls src={audioUrl} style={{ width: '100%', maxWidth: '500px' }} />
                </div>
            ) : (
                <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '4px solid #ef4444' }}>
                    <p style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <AlertCircle size={18} /> Audio file is missing for this lesson. You can still read the transcription below.
                    </p>
                </div>
            )}

            <div>
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <PlayCircle size={20} color="var(--primary)" /> Transcription (ಪ್ರತಿಲಿಪಿ)
                </h3>
                <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', background: 'var(--bg-dark)' }}>
                    <p style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '0.5rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        {transcription || "No transcription text provided."}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ListeningLab;
