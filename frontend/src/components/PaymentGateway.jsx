import React, { useState, useEffect } from 'react';
import api, { paymentApi } from '../utils/api';
import { useToast } from './Toast';

const PaymentGateway = ({ user }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const showToast = useToast();

    useEffect(() => {
        if (showHistory) {
            fetchHistory();
        }
    }, [showHistory]);

    const fetchHistory = async () => {
        try {
            const res = await paymentApi.getHistory();
            setHistory(res.data.history || []);
        } catch (err) {
            console.error('Failed to fetch payment history:', err);
        }
    };

    const handleSimulatePayment = async (status) => {
        setLoading(true);
        try {
            // 1. Create Order
            const orderRes = await paymentApi.createOrder({
                amount: 999.00,
                currency: 'INR'
            });

            const { transaction_id } = orderRes.data.order;

            // 2. Verify Payment (Simulate Gateway Response)
            setTimeout(async () => {
                try {
                    const verifyRes = await paymentApi.verifyPayment({
                        transactionId: transaction_id,
                        status: status
                    });

                    if (status === 'completed') {
                        showToast('Payment Successful! You are now a Premium Member.', 'success');
                    } else {
                        showToast('Payment Failed. Please try again.', 'error');
                    }
                    fetchHistory();
                } catch (err) {
                    showToast('Verification failed.', 'error');
                } finally {
                    setLoading(false);
                }
            }, 2000);

        } catch (err) {
            showToast('Failed to initiate payment.', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="payment-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--accent)', marginBottom: '1.5rem' }}>Simplish Premium Payment Gateway</h1>

            <div className="payment-card" style={{
                background: 'var(--bg-card)',
                padding: '2.5rem',
                borderRadius: '16px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                border: '1px solid var(--border)',
                marginBottom: '2rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>₹999 <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ Lifetime</span></h2>
                    <p style={{ color: 'var(--text-main)' }}>Unlock all advanced features and expert coaching modules.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        disabled={loading}
                        onClick={() => handleSimulatePayment('completed')}
                        className="btn btn-primary"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '1rem 2rem',
                            fontWeight: 'bold',
                            border: 'none'
                        }}
                    >
                        {loading ? 'Processing...' : 'Simulate Success'}
                    </button>

                    <button
                        disabled={loading}
                        onClick={() => handleSimulatePayment('failed')}
                        className="btn"
                        style={{
                            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                            color: 'white',
                            padding: '1rem 2rem',
                            fontWeight: 'bold',
                            border: 'none'
                        }}
                    >
                        {loading ? 'Processing...' : 'Simulate Failure'}
                    </button>
                </div>
            </div>

            <div style={{ textAlign: 'center' }}>
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }}
                >
                    {showHistory ? 'Hide Transaction History' : 'View Transaction History'}
                </button>
            </div>

            {showHistory && (
                <div style={{ marginTop: '2rem' }}>
                    <h3>Transaction History</h3>
                    {history.length === 0 ? (
                        <p>No transactions found.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--border)' }}>
                                    <th style={{ padding: '1rem' }}>ID</th>
                                    <th style={{ padding: '1rem' }}>Amount</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(txn => (
                                    <tr key={txn.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontSize: '0.85rem' }}>{txn.transaction_id}</td>
                                        <td style={{ padding: '1rem' }}>₹{txn.amount}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: txn.status === 'completed' ? '#d1fae5' : txn.status === 'failed' ? '#fee2e2' : '#fef3c7',
                                                color: txn.status === 'completed' ? '#065f46' : txn.status === 'failed' ? '#991b1b' : '#92400e'
                                            }}>
                                                {txn.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                            {new Date(txn.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default PaymentGateway;
