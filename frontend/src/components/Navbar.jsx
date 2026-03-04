import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sparkles, Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from './ThemeContext';

const Navbar = ({ toggleMobileMenu }) => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();

    // Map routes to human-readable titles
    const getPageTitle = (path) => {
        const route = path.replace('/', '') || 'dashboard';
        const titles = {
            'dashboard': 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (Dashboard)',
            'library': 'ನನ್ನ ಲೈಬ್ರರಿ (My Library)',
            'payment': 'ಪ್ರೀಮಿಯಂ (Go Premium)',
            'admin': 'ಪಾಠ ಅಪ್ಲೋಡ್ (Admin)',
            'edit_lesson': 'ಪಾಠ ತಿದ್ದುಪಡಿ (Edit Lesson)',
            'users': 'ಬಳಕೆದಾರರು (Users)',
            'reports': 'ವರದಿಗಳು (Reports)',
            'profile': 'ಪ್ರೊಫೈಲ್ (Profile)',
            'coaching': 'ತರಬೇತಿ (Coaching)',
            'assessment': 'ಮೌಲ್ಯಮಾಪನ (Assessment)',
            'study_area': 'ಸ್ಟಡಿ ಏರಿಯಾ (Study Area)'
        };
        return titles[route] || 'SIMPLISH';
    };

    return (
        <div className="top-navbar" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 2rem',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--border)',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            marginBottom: '1rem',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                    className="mobile-only"
                    onClick={toggleMobileMenu}
                    style={{
                        background: 'none', border: 'none', color: 'var(--text-main)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: '0.25rem', cursor: 'pointer', marginRight: '0.5rem'
                    }}
                    aria-label="Open Menu"
                >
                    <Menu size={24} />
                </button>
                <img src="/logo.png" alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'contain' }} />
                <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '0.05em',
                    color: 'var(--primary)',
                    textTransform: 'uppercase'
                }}>
                    SIMPLISH
                </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                    {getPageTitle(location.pathname)}
                </div>

                <button
                    onClick={toggleTheme}
                    style={{
                        background: 'var(--bg-dark)',
                        border: '1px solid var(--border)',
                        color: 'var(--text-main)',
                        padding: '0.5rem',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                </button>
            </div>
        </div >
    );
};

export default Navbar;
