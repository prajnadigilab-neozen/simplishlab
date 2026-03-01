import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Glasses, Target, Loader2 } from 'lucide-react';
import api from '../../utils/api';
import MagicShiftDashboard from './MagicShiftDashboard';
import SentenceEvolution from './SentenceEvolution';
import GoldList from './GoldList';
import MilestoneTest from './MilestoneTest';
import { useToast } from '../Toast';

const UniversalStudyArea = ({ user }) => {
    const [activeTab, setActiveTab] = useState('study'); // study, reading, test
    const [loading, setLoading] = useState(true);
    const showToast = useToast();

    // In a real app, this would be tied to the active lesson ID. 
    // Using a dummy ID or pulling the first active lesson for demonstration.
    const [lessonId, setLessonId] = useState(null);

    useEffect(() => {
        // Fetch user progress to restore last active tab
        const fetchProgress = async () => {
            try {
                const res = await api.get('/lesson/progress');
                // Note: the backend `/lesson/progress` returns `lessons` with embedded progress.
                // We'll just look for any started lesson that might have a tab saved.
                // Alternatively, we save the global tab setting in localStorage for immediate sync, 
                // and backend for cross-device.
                const savedTab = localStorage.getItem('simplish_last_tab') || 'study';
                setActiveTab(savedTab);

                if (res.data?.lessons?.length > 0) {
                    setLessonId(res.data.lessons[0].id);
                }
            } catch (err) {
                console.error("Failed to load progress", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProgress();
    }, []);

    const handleTabChange = async (tab) => {
        setActiveTab(tab);
        localStorage.setItem('simplish_last_tab', tab);

        // Persist to backend if we have a lesson context
        if (lessonId) {
            try {
                await api.post(`/lesson/${lessonId}/progress`, {
                    lastActiveTab: tab,
                    spentTimeMs: 0 // Just pinging update
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
            <header style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <BookOpen color="var(--primary)" /> ವಿಶ್ವಾತ್ಮಕ ಅಧ್ಯಯನ ಕೇಂದ್ರ (Universal Study Area)
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>Master English sentence structures seamlessly across any device.</p>
            </header>

            {/* Custom Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid var(--border)', overflowX: 'auto', paddingBottom: '2px' }}>
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
                    <Glasses size={18} /> Reading Lab (ಓದುವ ಪ್ರಯೋಗಾಲಯ)
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
                    <Target size={18} /> Milestone Test (ಮೈಲಿಗಲ್ಲು ಪರೀಕ್ಷೆ)
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
                            <MagicShiftDashboard />
                            <SentenceEvolution />
                        </div>
                    )}
                    {activeTab === 'reading' && (
                        <div>
                            <GoldList />
                        </div>
                    )}
                    {activeTab === 'test' && (
                        <div>
                            <MilestoneTest />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default UniversalStudyArea;
