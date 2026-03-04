import React, { useEffect, useState } from 'react';
import { reportApi } from '../utils/api';
import {
    Users,
    UserMinus,
    Activity,
    Clock,
    BarChart3,
    TrendingUp,
    Loader2,
    BookOpen,
    ArrowUpRight,
    ShieldAlert
} from 'lucide-react';

const Reports = () => {
    const [summary, setSummary] = useState(null);
    const [activity, setActivity] = useState([]);
    const [showAllActivity, setShowAllActivity] = useState(false);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [sumRes, actRes] = await Promise.all([
                    reportApi.getSummary(),
                    reportApi.getActivity()
                ]);
                setSummary(sumRes.data);
                setActivity(actRes.data);
            } catch (err) {
                console.error('Failed to load report data:', err);
            } finally {
                setLoading(false);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '4rem' }}>
                <Loader2 className="animate-spin" size={48} color="var(--primary)" />
            </div>
        );
    }

    const cards = [
        { title: 'Total Registered', value: summary?.totalUsers, icon: Users, color: '#4f46e5', bg: '#eef2ff' },
        { title: 'Active Today', value: summary?.activeToday, icon: Activity, color: '#059669', bg: '#ecfdf5' },
        { title: 'Inactive Users', value: summary?.inactiveUsers, icon: ShieldAlert, color: '#d97706', bg: '#fffbeb' },
        { title: 'Deleted Users', value: summary?.deletedUsers, icon: UserMinus, color: '#dc2626', bg: '#fef2f2' },
    ];

    return (
        <div style={{ padding: '2rem', animation: 'fadeIn 0.5s ease-out' }}>
            <header style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                            System Analytics
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', margin: 0 }}>
                            Comprehensive metrics and learning activity overview.
                        </p>
                    </div>
                    {lastUpdated && (
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            Last updated: {lastUpdated}
                        </div>
                    )}
                </div>
            </header>

            {/* KPI Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {cards.map((card, idx) => (
                    <div key={idx} className="glass-card" style={{
                        padding: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1.25rem',
                        transition: 'transform 0.2s',
                        cursor: 'default'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '16px',
                            backgroundColor: card.bg,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <card.icon size={28} color={card.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{card.title}</div>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>{card.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem', alignItems: 'start' }}>
                {/* Level Distribution */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <BarChart3 size={20} color="var(--primary)" /> Level Distribution
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.entries(summary?.levelDistribution || {}).map(([level, count]) => {
                            const percent = ((count / (summary?.totalUsers || 1)) * 100).toFixed(0);
                            return (
                                <div key={level}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                                        <span style={{ fontWeight: 600 }}>{level}</span>
                                        <span style={{ color: 'var(--text-muted)' }}>{count} users ({percent}%)</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            height: '100%',
                                            width: `${percent}%`,
                                            background: 'var(--primary)',
                                            borderRadius: '4px'
                                        }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Activity Table */}
                <div className="glass-card" style={{ padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <TrendingUp size={20} color="var(--primary)" /> Learner Activity
                        </h3>
                        {activity.length > 10 && (
                            <div
                                onClick={() => setShowAllActivity(!showAllActivity)}
                                style={{
                                    fontSize: '0.85rem',
                                    color: 'var(--primary)',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    padding: '0.5rem 0.75rem',
                                    borderRadius: '8px',
                                    background: 'rgba(var(--primary-rgb), 0.05)',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {showAllActivity ? 'Show Less' : `View All (${activity.length})`} <ArrowUpRight size={14} />
                            </div>
                        )}
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '0 1rem 1rem 0', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '200px' }}>STUDENT / LESSON</th>
                                    <th style={{ padding: '0 1rem 1rem 0', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '120px' }}>STATUS</th>
                                    <th style={{ padding: '0 1rem 1rem 0', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '80px' }}>SCORE</th>
                                    <th style={{ padding: '0 1rem 1rem 0', fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.85rem', minWidth: '150px' }}>LAST ACCESSED</th>
                                </tr>
                            </thead>
                            <tbody>
                                {(showAllActivity ? activity : activity.slice(0, 10)).map((item, i) => {
                                    const date = new Date(item.lastAccessed);
                                    const timeAgo = (date) => {
                                        const now = new Date();
                                        const sec = Math.floor((now - date) / 1000);
                                        if (sec < 60) return 'Just now';
                                        if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
                                        if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
                                        return date.toLocaleDateString();
                                    };

                                    return (
                                        <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1.25rem 0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div>
                                                        <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            {item.student}
                                                            {item.atRisk && (
                                                                <span title="At Risk: High time spent with low progress" style={{ color: '#ef4444' }}>
                                                                    <ShieldAlert size={14} />
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                                                            <BookOpen size={12} /> {item.lesson} • <span style={{ fontSize: '0.7rem', fontWeight: 600, opacity: 0.8 }}>{item.level}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 0' }}>
                                                {item.passed === true ? (
                                                    <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, background: '#ecfdf5', color: '#059669', textTransform: 'uppercase' }}>PASSED</span>
                                                ) : item.passed === false ? (
                                                    <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, background: '#fef2f2', color: '#dc2626', textTransform: 'uppercase' }}>FAILED</span>
                                                ) : (
                                                    <span style={{ padding: '4px 10px', borderRadius: '100px', fontSize: '0.7rem', fontWeight: 700, background: '#eff6ff', color: '#2563eb', textTransform: 'uppercase' }}>IN PROGRESS ({item.progress}%)</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '1.25rem 0' }}>
                                                <div style={{ fontSize: '1rem', fontWeight: 800, color: item.score >= 80 ? '#059669' : item.score !== null ? '#d97706' : 'var(--text-muted)' }}>
                                                    {item.score !== null ? `${item.score}%` : '--'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1.25rem 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                    <Clock size={14} /> {timeAgo(date)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Time spent: {item.timeSpentMin}m</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {activity.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No recent activity found.</div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
};

export default Reports;
