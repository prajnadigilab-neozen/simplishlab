const supabase = require('../config/supabase');
const crypto = require('crypto');

/**
 * Creates a mock payment order.
 * In a real scenario, this would call Razorpay/Stripe API.
 */
exports.createOrder = async (req, res) => {
    const { amount, currency = 'INR' } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    try {
        const transactionId = `MOCK_TXN_${crypto.randomUUID().split('-')[0].toUpperCase()}`;

        const { data, error } = await supabase
            .from('payments')
            .insert([{
                user_id: userId,
                amount,
                currency,
                status: 'pending',
                transaction_id: transactionId,
                provider: 'mock_gateway'
            }])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json({
            message: 'Payment order created successfully',
            order: data
        });
    } catch (error) {
        console.error('Create Order Error:', error);
        res.status(500).json({ message: 'Error creating payment order' });
    }
};

/**
 * Verifies a mock payment.
 * Simulates a webhook or a client-side success confirmation.
 */
exports.verifyPayment = async (req, res) => {
    const { transactionId, status } = req.body; // status: 'completed' or 'failed'
    const userId = req.user.id;

    if (!transactionId || !['completed', 'failed'].includes(status)) {
        return res.status(400).json({ message: 'Invalid transaction data' });
    }

    try {
        const { data, error } = await supabase
            .from('payments')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('transaction_id', transactionId)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;

        if (!data) {
            return res.status(404).json({ message: 'Transaction not found' });
        }

        res.json({
            message: `Payment ${status} successfully`,
            transaction: data
        });
    } catch (error) {
        console.error('Verify Payment Error:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
};

/**
 * Fetches the payment history for the logged-in user.
 */
exports.getPaymentHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.json({
            history: data
        });
    } catch (error) {
        console.error('Get Payment History Error:', error);
        res.status(500).json({ message: 'Error fetching payment history' });
    }
};
