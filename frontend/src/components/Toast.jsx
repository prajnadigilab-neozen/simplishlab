import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

// ── Context ────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

const ICONS = {
    success: <CheckCircle2 size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
    warning: <AlertCircle size={18} />,
};

const COLORS = {
    success: { bg: '#f0fdf4', border: '#86efac', text: '#166534', icon: '#22c55e' },
    error: { bg: '#fef2f2', border: '#fca5a5', text: '#991b1b', icon: '#ef4444' },
    info: { bg: '#eff6ff', border: '#93c5fd', text: '#1e40af', icon: '#3b82f6' },
    warning: { bg: '#fffbeb', border: '#fcd34d', text: '#92400e', icon: '#f59e0b' },
};

// ── Provider ───────────────────────────────────────────────────────────────
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'info', duration = 3500) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={showToast}>
            {children}
            {/* Toast container */}
            <div style={{
                position: 'fixed', top: '1.5rem', right: '1.5rem',
                zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '0.75rem',
                maxWidth: '360px', width: '100%'
            }}>
                <AnimatePresence>
                    {toasts.map(toast => {
                        const c = COLORS[toast.type] || COLORS.info;
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, x: 60, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 60, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                style={{
                                    background: c.bg, border: `1px solid ${c.border}`,
                                    borderRadius: '0.75rem', padding: '0.9rem 1rem',
                                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                                    boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
                                }}
                            >
                                <span style={{ color: c.icon, flexShrink: 0, marginTop: '1px' }}>
                                    {ICONS[toast.type]}
                                </span>
                                <span style={{ flex: 1, fontSize: '0.9rem', color: c.text, lineHeight: 1.4 }}>
                                    {toast.message}
                                </span>
                                <button
                                    onClick={() => dismiss(toast.id)}
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, opacity: 0.6, padding: 0, flexShrink: 0 }}
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

// ── Hook ───────────────────────────────────────────────────────────────────
export const useToast = () => {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within a <ToastProvider>');
    return ctx;
};
