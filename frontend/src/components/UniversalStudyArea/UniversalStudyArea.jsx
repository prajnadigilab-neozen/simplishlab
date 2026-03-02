import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Glasses, Target, Loader2, Headphones, Sparkles, ChevronLeft } from 'lucide-react';
import api from '../../utils/api';
import MagicShiftDashboard from './MagicShiftDashboard';
import SentenceEvolution from './SentenceEvolution';
import ReadingLab from './ReadingLab';
import ListeningLab from './ListeningLab';
import VocabularyLab from './VocabularyLab';
import MilestoneTest from './MilestoneTest';
import { useToast } from '../Toast';

const UniversalStudyArea = ({ user, lesson, onBack }) => {
    const [activeTab, setActiveTab] = useState('study'); // study, reading, listening, vocabulary, test
    const [loading, setLoading] = useState(true);
    const showToast = useToast();

    useEffect(() => {
        // We received the lesson object from props!
        // We can just set loading to false.
        // Or if we want to restore last active tab:
        const savedTab = localStorage.getItem('simplish_last_tab') || 'study';
        setActiveTab(savedTab);
        setLoading(false);
    }, [lesson]);

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        localStorage.setItem('simplish_last_tab', tab);

        // Ping backend to save progress
        if (lesson?.id) {
            try {
                await api.post(`/lessons/${lesson.id}/progress`, {
                    lastActiveTab: tab,
                    spentTimeMs: 0
                });
            } catch (err) {
                console.error("Failed to save cross-device tab state", err);
            }
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    }

    return (
        <div className="universal-study-area">
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button
                    onClick={onBack}
                    style={{
                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-main)',
                        padding: '0.6rem', borderRadius: '12px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <ChevronLeft size={22} />
                </button>
                <div>
                    <h1 style={{ fontSize: '1.8rem', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <BookOpen color="var(--primary)" /> {lesson?.title || 'Universal Study Area'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0, marginTop: '0.25rem' }}>Master English sentence structures seamlessly across any device.</p>
                </div>
            </header>

            {/* Custom Tab Navigation */}
            <div className="hide-scrollbar" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', overflowX: 'auto', paddingBottom: '2px', touchAction: 'pan-x' }}>
                <button
                    onClick={() => handleTabChange('study')}
                    className="touch-target"
                    style={{
                        background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: activeTab === 'study' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'study' ? '3px solid var(--primary)' : '3px solid transparent',
                        marginBottom: '-2px', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                >
                    <BookOpen size={18} /> Study (ಅಧ್ಯಯನ)
                </button>
                <button
                    onClick={() => handleTabChange('reading')}
                    className="touch-target"
                    style={{
                        background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: activeTab === 'reading' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'reading' ? '3px solid var(--primary)' : '3px solid transparent',
                        marginBottom: '-2px', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                >
                    <Glasses size={18} /> Reading (ಓದಿ ತಿಳಿ)
                </button>
                <button
                    onClick={() => handleTabChange('listening')}
                    className="touch-target"
                    style={{
                        background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: activeTab === 'listening' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'listening' ? '3px solid var(--primary)' : '3px solid transparent',
                        marginBottom: '-2px', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                >
                    <Headphones size={18} /> Listening (ಕೇಳಿ ಕಲಿ)
                </button>
                <button
                    onClick={() => handleTabChange('vocabulary')}
                    className="touch-target"
                    style={{
                        background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: activeTab === 'vocabulary' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'vocabulary' ? '3px solid var(--primary)' : '3px solid transparent',
                        marginBottom: '-2px', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                >
                    <Sparkles size={18} /> Vocabulary (ಶಬ್ದಕೋಶ)
                </button>
                <button
                    onClick={() => handleTabChange('test')}
                    className="touch-target"
                    style={{
                        background: 'none', border: 'none', padding: '0.75rem 1.5rem', cursor: 'pointer',
                        fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem',
                        color: activeTab === 'test' ? 'var(--primary)' : 'var(--text-muted)',
                        borderBottom: activeTab === 'test' ? '3px solid var(--primary)' : '3px solid transparent',
                        marginBottom: '-2px', transition: 'all 0.2s', whiteSpace: 'nowrap'
                    }}
                >
                    <Target size={18} /> Milestone Test (ಮೈಲಿಗಲ್ಲು)
                </button>
            </div>

            {/* Content Area with smooth transitions */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'study' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <MagicShiftDashboard logicContent={lesson?.content?.logicContent} />
                            <SentenceEvolution evolutionContent={lesson?.content?.evolutionContent} />
                        </div>
                    )}
                    {activeTab === 'reading' && (
                        <div>
                            <ReadingLab readingContent={lesson?.content?.readingContent} />
                        </div>
                    )}
                    {activeTab === 'listening' && (
                        <div>
                            <ListeningLab transcription={lesson?.transcription} audioUrl={lesson?.audio_url} />
                        </div>
                    )}
                    {activeTab === 'vocabulary' && (
                        <div>
                            <VocabularyLab vocabularyContent={lesson?.content?.vocabularyContent} />
                        </div>
                    )}
                    {activeTab === 'test' && (
                        <div>
                            <MilestoneTest
                                testContent={lesson?.content?.milestoneTest}
                                lessonId={lesson?.id}
                                onComplete={() => showToast("Test Complete! Points updated.", 'success')}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UniversalStudyArea;
