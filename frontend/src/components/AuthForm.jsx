import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Smartphone, Lock, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authApi } from '../utils/api';

const AuthForm = ({ onLoginSuccess }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        password: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isRegister) {
                // Ensure 10 digits
                const cleaned = formData.phone.replace(/\D/g, '');
                if (cleaned.length < 10) {
                    setError('ದಯವಿಟ್ಟು 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ. (Please enter a 10-digit phone number.)');
                    setLoading(false);
                    return;
                }
                const normalized = cleaned.slice(-10);

                await authApi.register({ ...formData, phone: normalized });
                // After registration, automatically login
                const loginRes = await authApi.login({
                    phone: normalized,
                    password: formData.password
                });
                onLoginSuccess(loginRes.data.user, loginRes.data.token);
            } else {
                const cleaned = formData.phone.replace(/\D/g, '');
                const normalized = cleaned.length >= 10 ? cleaned.slice(-10) : cleaned;

                const res = await authApi.login({
                    phone: normalized,
                    password: formData.password
                });
                onLoginSuccess(res.data.user, res.data.token);
            }
        } catch (err) {
            const status = err.response?.status;
            let errMsg = err.response?.data?.message || 'Something went wrong';

            // Provide a user-friendly message for "User already exists"
            if (status === 422 && errMsg.toLowerCase().includes('already registered')) {
                errMsg = 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ/ಇಮೇಲ್ ಈಗಾಗಲೇ ನೊಂದಾಯಿತವಾಗಿದೆ. ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಮಾಡಿ. (User already exists. Please Sign In.)';
            }

            setError(errMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card" style={{ padding: '2.5rem', width: '100%', maxWidth: '400px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <h2 style={{ marginBottom: '0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
                {isRegister ? 'ಹೊಸ ಖಾತೆ ತೆರೆಯಿರಿ (Create Account)' : 'ಲಾಗಿನ್ ಮಾಡಿ (Sign In)'}
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
                {isRegister ? 'ಕಲಿಯಲು ಪ್ರಾರಂಭಿಸಲು ನೋಂದಾಯಿಸಿ' : 'ನಿಮ್ಮ ಕಲಿಕೆಯನ್ನು ಮುಂದುವರಿಸಲು ಲಾಗಿನ್ ಮಾಡಿ'}
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {isRegister && (
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>ಪೂರ್ಣ ಹೆಸರು (Full Name)</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input
                                type="text"
                                required
                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-main)' }}
                                placeholder="John Doe"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            />
                        </div>
                    </div>
                )}

                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone Number)</label>
                    <div style={{ position: 'relative' }}>
                        <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="tel"
                            required
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-main)' }}
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            maxLength={10}
                        />
                    </div>
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>ಪಾಸ್ವರ್ಡ್ (Password)</label>
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="password"
                            required
                            style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.8rem', borderRadius: '0.5rem', border: '1px solid var(--border)', background: 'var(--bg-dark)', color: 'var(--text-main)' }}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    {isRegister && (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Password must be at least 8 characters and include letters and numbers.
                        </p>
                    )}
                </div>

                {error && (
                    <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '0.25rem' }}>
                        {error}
                    </div>
                )}

                <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={loading}
                    style={{ width: '100%', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
                    {isRegister ? 'ಖಾತೆ ರಚಿಸಿ (Register)' : 'ಲಾಗಿನ್ ಮಾಡಿ (Sign In)'}
                </button>
            </form>

            <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>
                    {isRegister ? 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ? ' : 'ಖಾತೆ ಇಲ್ಲವೇ? '}
                </span>
                <button
                    onClick={() => setIsRegister(!isRegister)}
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                    {isRegister ? 'ಸೈನ್ ಇನ್ ಮಾಡಿ (Sign In)' : 'ನೋಂದಾಯಿಸಿ (Register)'}
                </button>
            </div>
        </div>
    );
};

export default AuthForm;
