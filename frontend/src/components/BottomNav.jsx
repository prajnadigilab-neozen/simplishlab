import React from 'react';
import { LayoutDashboard, Library, CreditCard, User, Sparkles } from 'lucide-react';

const BottomNav = ({ onNavigate, currentView, user }) => {
    // Only show for users, or always show for everyone? Let's show for everyone so mobile is consistent.
    const items = [
        { icon: LayoutDashboard, label: 'Home', id: 'dashboard' },
        { icon: Sparkles, label: 'Study', id: 'study_area' },
        { icon: Library, label: 'Library', id: 'library' },
        { icon: CreditCard, label: 'Premium', id: 'payment' },
        { icon: User, label: 'Profile', id: 'profile' },
    ];

    return (
        <nav className="bottom-nav glass-card" style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 'var(--bottom-nav-height)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 90, // below sidebar overlay
            padding: '0 0.5rem',
            borderTop: '1px solid var(--border)',
            borderBottom: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            borderRadius: '1.5rem 1.5rem 0 0',
            backgroundColor: 'var(--nav-bg)'
        }}>
            {items.map(item => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                            flex: 1,
                            padding: '0.5rem 0'
                        }}
                    >
                        {item.id === 'study_area' ? (
                            <img src="/logo.png" alt="Study" style={{ width: '22px', height: '22px', borderRadius: '4px', filter: isActive ? 'none' : 'grayscale(100%) opacity(0.6)' }} />
                        ) : (
                            <item.icon size={22} color={isActive ? "var(--primary)" : "var(--text-muted)"} />
                        )}
                        <span style={{
                            fontSize: '0.65rem',
                            fontWeight: isActive ? '700' : '500',
                            transition: 'all 0.2s'
                        }}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
