const rateLimit = require('express-rate-limit');

// Rate limiter: max 10 attempts per 15-minute window per IP
// Protects against brute-force attacks on login and registration.
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many attempts from this IP. Please try again in 15 minutes.' }
});

module.exports = apiLimiter;
