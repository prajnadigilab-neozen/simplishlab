import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Loader2 } from 'lucide-react';
import { lessonApi, placementApi, reportApi } from '../utils/api';

const Dashboard = ({ user, onStartLesson }) => {
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
    const [adminStats, setAdminStats] = useState(null);
    const [expandedLevel, setExpandedLevel] = useState(null);

    const isAdmin = ['super_admin', 'admin', 'moderator'].includes(user?.role?.toLowerCase());

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                let lessonsData = [];
                let leaderboardData = [];
                let statsData = null;

                if (isAdmin) {
                    const [lessonsRes, leaderboardRes, statsRes] = await Promise.all([
                        lessonApi.getAll(),
                        placementApi.getLeaderboard(),
                        reportApi.getSummary()
                    ]);
                    lessonsData = Array.isArray(lessonsRes?.data) ? lessonsRes.data : (lessonsRes?.data?.lessons || []);
                    leaderboardData = leaderboardRes?.data || [];
                    statsData = statsRes?.data || null;
                } else {
                    const [lessonsRes, leaderboardRes] = await Promise.all([
                        lessonApi.getMyProgress(),
                        placementApi.getLeaderboard()
                    ]);
                    lessonsData = Array.isArray(lessonsRes?.data) ? lessonsRes.data : (lessonsRes?.data?.lessons || []);
                    leaderboardData = leaderboardRes?.data || [];
                }

                setLessons(lessonsData);
                setLeaderboard(leaderboardData);
                setAdminStats(statsData);
            } catch (err) {
                console.error("Error fetching dashboard data:", err);
                setError("Failed to load dashboard data. Please check if the backend is running.");
            } finally {
                setLoading(false);
                setLoadingLeaderboard(false);
            }
        };
        fetchDashboardData();
    }, []);

    const levels = ["Basic", "Intermediate", "Advanced", "Expert"];

    // Sort lessons explicitly by curriculum Level, then recursively by display_order
    const sortedLessons = [...lessons].sort((a, b) => {
        const levelDiff = levels.indexOf(a.level) - levels.indexOf(b.level);
        if (levelDiff !== 0) return levelDiff;
        return (a.display_order || 0) - (b.display_order || 0);
    });

    // Find the lesson the user is currently working on or the next logical one
    const currentLesson =
        sortedLessons.find(l => (l.status === 'started' || l.progress > 0) && l.progress < 100) || // Partially complete
        sortedLessons.find(l => l.status !== 'completed') || // Next fully unstarted
        sortedLessons[0] || // All finished; default to the beginning
        {
            title: "No lessons available yet",
            progress: 0,
            level: "N/A"
        };

    if (loading) {
        return (
            <div className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    return (
        <div className="main-content">
            <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        flexShrink: 0
                    }}>
                        {user?.avatarUrl ? (
                            <img src={user.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>
                                {user?.fullName?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ fontSize: '2rem', margin: 0 }}>ನಮಸ್ಕಾರ, {user?.fullName?.split(' ')[0]}!</h1>
                            <span style={{
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '20px',
                                fontSize: '0.65rem',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                                PREMIUM
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-muted)', margin: 0 }}>ಬನ್ನಿ, ಇಂಗ್ಲಿಷ್ ಕಲಿಯೋಣ. (Come, let's learn English.)</p>
                    </div>
                </div>


            </header>

            {error && (
                <div style={{ color: '#dc2626', marginBottom: '2rem', padding: '1rem', border: '1px solid #fecaca', borderRadius: '0.5rem', background: '#fef2f2' }}>
                    {error}
                </div>
            )}

            <div className="dashboard-grid">
                <div className="left-column">
                    {isAdmin ? (
                        <section>
                            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span>ವ್ಯಾಸಂಗದ ಒಟ್ಟಾರೆ ಮಾಹಿತಿ (Curriculum Overview)</span>
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                {levels.map((lvl) => {
                                    const lessonsInLevel = lessons.filter(l => l.level === lvl).length;
                                    const usersInLevel = adminStats?.levelDistribution?.[lvl] || 0;
                                    return (
                                        <motion.div
                                            key={lvl}
                                            className="glass-card"
                                            style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}
                                        >
                                            <h4 style={{ margin: '0 0 1.5rem 0', color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <span>{lvl} English</span>
                                            </h4>

                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                                <span style={{ color: 'var(--text-muted)' }}>Total Lessons</span>
                                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)' }}>{lessonsInLevel}</span>
                                            </div>


                                        </motion.div>
                                    );
                                })}
                            </div>
                        </section>
                    ) : (
                        <>
                            {/* Pick up where you left off */}
                            <section style={{ marginBottom: '4rem' }}>
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span>ಮುಂದುವರಿಸಿ (Continue)</span>
                                </h3>
                                <motion.div
                                    className="glass-card"
                                    style={{ padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <span style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.8rem' }}>{currentLesson.level}</span>
                                        <h2 style={{ margin: '0.5rem 0' }}>{currentLesson.title}</h2>
                                        <div style={{ maxWidth: '400px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.8rem' }}>
                                                <span>ಪ್ರಗತಿ (Progress)</span>
                                                <span>{currentLesson.progress || 0}%</span>
                                            </div>
                                            <div className="progress-bar">
                                                <motion.div
                                                    className="progress-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${currentLesson.progress || 0}%` }}
                                                    transition={{ duration: 1 }}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                        disabled={!lessons.length}
                                        onClick={() => onStartLesson && onStartLesson(currentLesson)}
                                    >
                                        <Play size={18} fill="currentColor" />
                                        <span>ಪ್ರಾರಂಭಿಸಿ (Start)</span>
                                    </button>
                                </motion.div>
                            </section>

                            {/* Learning Path */}
                            <section>
                                <h3 style={{ marginBottom: '1.5rem' }}>ನಿಮ್ಮ ಕಲಿಕೆಯ ಹಾದಿ (Your Learning Path)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {levels.map((lvl, index) => {
                                        const lessonsInLevel = lessons.filter(l => l.level === lvl);

                                        // Level Locking Logic
                                        let isLocked = false;
                                        if (index > 0) {
                                            const prevLevel = levels[index - 1];
                                            const lessonsInPrevLevel = lessons.filter(l => l.level === prevLevel);
                                            if (lessonsInPrevLevel.length > 0) {
                                                const totalProg = lessonsInPrevLevel.reduce((acc, l) => acc + (l.progress || 0), 0);
                                                const avgProg = Math.round(totalProg / lessonsInPrevLevel.length);
                                                isLocked = avgProg < 100;
                                            }
                                        }

                                        const isExpanded = expandedLevel === lvl;

                                        return (
                                            <motion.div
                                                key={lvl}
                                                className="glass-card"
                                                style={{
                                                    padding: '1.5rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    opacity: isLocked ? 0.6 : 1,
                                                    filter: isLocked ? 'grayscale(30%)' : 'none'
                                                }}
                                                whileHover={!isLocked ? { scale: 1.01, borderColor: 'var(--primary)' } : {}}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 'bold' }}>MODULE {index + 1}</span>
                                                    {isLocked && <span style={{ fontSize: '1.2rem' }}>🔒</span>}
                                                </div>
                                                <h4 style={{ margin: '0 0 0.5rem 0' }}>{lvl} English</h4>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flex: 1 }}>
                                                    {lessonsInLevel.length > 0
                                                        ? `Explore ${lessonsInLevel.length} active lessons in this module.`
                                                        : `Master the ${lvl.toLowerCase()} levels of spoken English and grammar.`}
                                                </p>

                                                {/* Module Progress & Score */}
                                                {lessonsInLevel.length > 0 && !isLocked && (
                                                    <div style={{ marginBottom: '1rem' }}>
                                                        {(() => {
                                                            const totalProg = lessonsInLevel.reduce((acc, l) => acc + (l.progress || 0), 0);
                                                            const avgProg = Math.round(totalProg / lessonsInLevel.length);

                                                            const scoredLessons = lessonsInLevel.filter(l => l.score !== null);
                                                            const totalScore = scoredLessons.reduce((acc, l) => acc + l.score, 0);
                                                            const avgScore = scoredLessons.length > 0 ? Math.round(totalScore / scoredLessons.length) : null;

                                                            return (
                                                                <div style={{ fontSize: '0.8rem' }}>
                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                                        <span>Module Completion:</span>
                                                                        <span style={{ fontWeight: 'bold' }}>{avgProg}%</span>
                                                                    </div>
                                                                    <div className="progress-bar" style={{ height: '6px', marginBottom: '8px' }}>
                                                                        <div className="progress-fill" style={{ width: `${avgProg}%` }}></div>
                                                                    </div>
                                                                    {avgScore !== null && (
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', fontWeight: 'bold' }}>
                                                                            <span>Assessment Score:</span>
                                                                            <span>{avgScore}%</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )
                                                        })()}
                                                    </div>
                                                )}

                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                                                    <span style={{ fontSize: '0.8rem' }}>{lessonsInLevel.length} Lessons</span>
                                                    <button
                                                        style={{
                                                            background: 'none',
                                                            border: 'none',
                                                            color: isLocked ? 'var(--text-muted)' : 'var(--primary)',
                                                            cursor: isLocked ? 'not-allowed' : 'pointer',
                                                            fontSize: '0.85rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                        disabled={isLocked}
                                                        onClick={() => setExpandedLevel(isExpanded ? null : lvl)}
                                                    >
                                                        {isExpanded ? 'ಮುಚ್ಚಿ (Close) ↑' : 'ನೋಡಿ (View) →'}
                                                    </button>
                                                </div>

                                                {/* Expandable Lesson View */}
                                                {isExpanded && !isLocked && (
                                                    <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                                                        <h5 style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Lessons in this module:</h5>
                                                        {lessonsInLevel.length === 0 ? (
                                                            <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>No lessons available yet.</p>
                                                        ) : (
                                                            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                {lessonsInLevel.map(l => (
                                                                    <li key={l.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', padding: '0.75rem', background: 'rgba(0,0,0,0.02)', borderRadius: '4px' }}>
                                                                        <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: '1rem' }} title={l.title}>
                                                                            {l.title}
                                                                        </span>
                                                                        <span style={{
                                                                            fontWeight: 'bold',
                                                                            color: l.progress === 100 ? '#16a34a' : 'var(--text-main)',
                                                                            flexShrink: 0
                                                                        }}>
                                                                            {l.progress === 100 ? 'Completed' : `${l.progress || 0}%`}
                                                                        </span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        )}
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </section>
                        </>
                    )}
                </div>

                {/* Right Column: Leaderboard */}
                <div className="right-column">
                    <section>
                        <h3 style={{ marginBottom: '1.5rem' }}>ಲೀಡರ್‌ಬೋರ್ಡ್ (Leaderboard)</h3>
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            {loadingLeaderboard ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                                    <Loader2 className="animate-spin" size={24} color="var(--primary)" />
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>No scores yet.</p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {leaderboard.map((entry, idx) => (
                                        <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '0.75rem', borderBottom: idx !== leaderboard.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                            <div style={{
                                                width: '28px', height: '28px', borderRadius: '50%',
                                                background: idx === 0 ? '#fef3c7' : idx === 1 ? '#f1f5f9' : idx === 2 ? '#fff7ed' : 'var(--bg-dark)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--border)',
                                                overflow: 'hidden'
                                            }}>
                                                {entry.avatarUrl ? (
                                                    <img src={entry.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                ) : (
                                                    idx + 1
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{entry.userName}</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(entry.date).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>{entry.score}%</div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{entry.level}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
