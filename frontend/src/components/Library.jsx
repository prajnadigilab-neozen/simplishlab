import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Music, Video, ArrowRight, Loader2, Search, Edit, Trash2, Plus, Image } from 'lucide-react';
import { lessonApi } from '../utils/api';
import { useToast } from './Toast';

const Library = ({ user, onSelectLesson, onEditLesson, onAddLesson }) => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [expandedModules, setExpandedModules] = useState(['Basic']);
    const showToast = useToast();

    const isMod = ['super_admin', 'admin', 'moderator'].includes(user?.role?.toLowerCase());
    const levels = ["Basic", "Intermediate", "Advanced", "Expert"];

    const fetchLessons = async () => {
        try {
            const response = isMod ? await lessonApi.getAll() : await lessonApi.getMyProgress();
            const data = Array.isArray(response.data) ? response.data : (response.data.lessons || []);
            setLessons(data);
        } catch (err) {
            console.error("Error fetching library:", err);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, []);

    const handleDelete = async (e, id) => {
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const confirmDelete = async () => {
        const id = confirmDeleteId;
        setConfirmDeleteId(null);
        try {
            await lessonApi.delete(id);
            setLessons(lessons.filter(l => l.id !== id));
            showToast('Lesson deleted successfully.', 'success');
        } catch (err) {
            showToast('Failed to delete lesson. Please try again.', 'error');
        }
    };

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'pdf': return <FileText size={20} />;
            case 'audio': return <Music size={20} />;
            case 'video': return <Video size={20} />;
            case 'image': return <Image size={20} />;
            default: return <FileText size={20} />;
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="library-container">
            {/* Confirm Delete Dialog */}
            {confirmDeleteId && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
                        <h3 style={{ marginBottom: '0.75rem' }}>Delete Lesson?</h3>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                            This will permanently remove the lesson and its media file. This cannot be undone.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn" onClick={() => setConfirmDeleteId(null)} style={{ background: 'var(--bg-dark)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>Cancel</button>
                            <button className="btn" onClick={confirmDelete} style={{ background: '#ef4444', color: '#fff' }}>Delete</button>
                        </div>
                    </div>
                </div>
            )}
            <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>ನನ್ನ ಲೈಬ್ರರಿ (My Library)</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Explore all your uploaded curriculum modules.</p>
                </div>
                {isMod && (
                    <button
                        className="btn btn-primary"
                        onClick={onAddLesson}
                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem' }}
                    >
                        <Plus size={18} /> Add New Lesson
                    </button>
                )}
            </header>

            <div className="glass-card" style={{ padding: '0.75rem 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Search size={20} color="var(--text-muted)" />
                <input
                    type="text"
                    placeholder="Search lessons..."
                    style={{ background: 'none', border: 'none', color: 'var(--text-main)', outline: 'none', width: '100%', fontSize: '1rem' }}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredLessons.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <p>No lessons found. {isMod ? 'Click "Add New Lesson" to get started!' : ''}</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {levels.map((lvl, levelIndex) => {
                        const lessonsInLevel = filteredLessons.filter(l => l.level === lvl);

                        if (lessonsInLevel.length === 0 && searchQuery) return null;

                        // Robust locking: Module is locked if any lesson in any previous level is incomplete
                        const prevLevels = levels.slice(0, levelIndex);
                        const lessonsInPrevLevels = lessons.filter(l => prevLevels.includes(l.level));
                        const isLocked = !isMod && levelIndex > 0 && lessonsInPrevLevels.some(l => (l.progress || 0) < 100);

                        const isExpanded = expandedModules.includes(lvl);
                        const toggleModule = () => {
                            if (isLocked) return;
                            setExpandedModules(prev =>
                                prev.includes(lvl) ? prev.filter(m => m !== lvl) : [...prev, lvl]
                            );
                        };

                        return (
                            <div key={lvl} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Module Header */}
                                <div
                                    className="glass-card"
                                    onClick={toggleModule}
                                    style={{
                                        padding: '1.5rem',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: isLocked ? 'not-allowed' : 'pointer',
                                        opacity: isLocked ? 0.6 : 1,
                                        filter: isLocked ? 'grayscale(80%)' : 'none',
                                        background: isExpanded ? 'var(--bg-dark)' : 'rgba(255,255,255,0.02)',
                                        borderLeft: isExpanded && !isLocked ? '4px solid var(--primary)' : '1px solid var(--border)'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>MODULE {levelIndex + 1}</span>
                                            {isLocked && <span>🔒</span>}
                                        </div>
                                        <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{lvl} English</h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{lessonsInLevel.length} Lessons</span>
                                        <button
                                            style={{ background: 'none', border: 'none', color: isLocked ? 'var(--text-muted)' : 'var(--primary)', fontWeight: 'bold', cursor: isLocked ? 'not-allowed' : 'pointer' }}
                                        >
                                            {isExpanded ? 'Collapse ↑' : 'Expand ↓'}
                                        </button>
                                    </div>
                                </div>

                                {/* Module Content */}
                                {isExpanded && !isLocked && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', padding: '0.5rem' }}>
                                        {lessonsInLevel.length === 0 ? (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', padding: '1rem' }}>No lessons available in this module.</p>
                                        ) : (
                                            lessonsInLevel.map((lesson, index) => (
                                                <motion.div
                                                    key={lesson.id}
                                                    className="glass-card"
                                                    style={{
                                                        padding: '1.5rem',
                                                        cursor: 'pointer',
                                                        border: '1px solid var(--border)',
                                                        position: 'relative'
                                                    }}
                                                    whileHover={{ scale: 1.01, borderColor: 'var(--primary)', backgroundColor: 'var(--bg-dark)' }}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                                        <div style={{
                                                            padding: '0.75rem',
                                                            borderRadius: '0.75rem',
                                                            background: 'var(--primary-light)',
                                                            color: 'var(--primary)'
                                                        }}>
                                                            {getIcon(lesson.media_type)}
                                                        </div>
                                                        {isMod && (
                                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); onEditLesson(lesson); }}
                                                                    style={{
                                                                        background: 'var(--bg-dark)',
                                                                        border: '1px solid var(--border)',
                                                                        color: 'var(--text-main)',
                                                                        padding: '0.4rem',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    title="Edit Lesson"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={(e) => handleDelete(e, lesson.id)}
                                                                    style={{
                                                                        background: 'rgba(239, 68, 68, 0.1)',
                                                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                                                        color: '#ef4444',
                                                                        padding: '0.4rem',
                                                                        borderRadius: '6px',
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center'
                                                                    }}
                                                                    title="Delete Lesson"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div onClick={() => onSelectLesson(lesson)}>
                                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{lesson.title}</h3>
                                                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineBreak: 'anywhere' }}>
                                                            {lesson.description?.substring(0, 100)}{lesson.description?.length > 100 ? '...' : ''}
                                                        </p>

                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>LEVEL: {lesson.level}</span>
                                                            {lesson.progress === 100 ? (
                                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                                                                    <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.75rem' }}>Completed ✓</span>
                                                                    {lesson.score !== null && lesson.score !== undefined && (
                                                                        <span style={{ color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 600 }}>Score: {lesson.score}%</span>
                                                                    )}
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
                                                                    Learn <ArrowRight size={14} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Library;
