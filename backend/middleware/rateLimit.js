const rateLimit = require('express-rate-limit');

// Rate limiter: max 500 requests per 15-minute window per IP
// Only active in production — disabled in dev to avoid false 429s during testing.
const apiLimiter = process.env.NODE_ENV === 'production'
    ? rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 500,
        standardHeaders: true,
        legacyHeaders: false,
        message: { message: 'Too many attempts from this IP. Please try again in 15 minutes.' }
    })
    : (req, res, next) => next(); // No-op in development

module.exports = apiLimiter;
