const supabase = require('../config/supabase');

module.exports = async (req, res, next) => {
    // Bypass for integration tests
    if (process.env.NODE_ENV === 'test') {
        req.user = { id: 'test-user-id', role: 'super_admin', email: 'test@example.com' };
        return next();
    }

    const header = req.headers.authorization || req.headers.Authorization;
    let token;

    if (header) {
        token = header.split(' ')[1];
    } else if (req.cookies && req.cookies.simplish_session) {
        token = req.cookies.simplish_session;
    }

    if (!token) return res.status(401).json({ message: 'No authentication token provided' });

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Attach user info to request
        // role is stored in app_metadata or user_metadata in Supabase
        const role = user.app_metadata?.role || user.user_metadata?.role || 'user';

        req.user = {
            id: user.id,
            role: role,
            email: user.email
        };
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        return res.status(401).json({ message: 'Authentication failed' });
    }
};
