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

const UniversalStudyArea = ({ user, lesson, onBack, isCourseCompleted, onNextLesson }) => {
    const [activeTab, setActiveTab] = useState('study'); // study, reading, listening, vocabulary, test
    const [loading, setLoading] = useState(true);
    const showToast = useToast();

    useEffect(() => {
        // Reset to study tab for new lesson unless course is completed
        if (!isCourseCompleted) {
            setActiveTab('study');
        }
        setLoading(false);
    }, [lesson, isCourseCompleted]);

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

    if (isCourseCompleted) {
        return (
            <div className="universal-study-area" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="glass-card"
                    style={{ padding: '4rem', background: 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', border: '2px solid var(--primary)' }}
                >
                    <Sparkles size={80} color="var(--primary)" style={{ marginBottom: '2rem' }} />
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>ಅಭಿನಂದನೆಗಳು! (Congratulations!)</h1>
                    <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem hover' }}>
                        You've successfully completed all available lessons. You're well on your way to mastering English! 🚀
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
                        <button className="btn btn-primary" onClick={onBack} style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                            Go to Library
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="universal-study-area">
            {/* Header and other UI elements... */}
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
            {/* ... (existing tab navigation) */}
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
                                onComplete={() => {
                                    showToast("ಪರೀಕ್ಷೆ ಪೂರ್ಣಗೊಂಡಿದೆ! (Test Complete!)", 'success');
                                    if (onNextLesson) onNextLesson();
                                }}
                            />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Footer */}
            {/* ... (existing nav footer) */}
            {/* Navigation Footer */}
            <div style={{
                marginTop: '3rem',
                padding: '1.5rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '0 0 16px 16px'
            }}>
                <div>
                    {activeTab !== 'study' && (
                        <button
                            onClick={() => {
                                const sequence = ['study', 'reading', 'listening', 'vocabulary', 'test'];
                                const currentIndex = sequence.indexOf(activeTab);
                                handleTabChange(sequence[currentIndex - 1]);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '0.8rem 1.5rem', color: 'var(--text-main)' }}
                        >
                            ← Previous Section
                        </button>
                    )}
                </div>
                <div>
                    {activeTab !== 'test' && (
                        <button
                            onClick={() => {
                                const sequence = ['study', 'reading', 'listening', 'vocabulary', 'test'];
                                const currentIndex = sequence.indexOf(activeTab);
                                handleTabChange(sequence[currentIndex + 1]);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="btn btn-primary"
                            style={{ padding: '0.8rem 2.5rem', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }}
                        >
                            Next Section: {
                                activeTab === 'study' ? 'Reading' :
                                    activeTab === 'reading' ? 'Listening' :
                                        activeTab === 'listening' ? 'Vocabulary' : 'Milestone Test'
                            } →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UniversalStudyArea;
