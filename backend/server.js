const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
const dailyCleanup = require('./scripts/dailyCleanup');
require('dotenv').config();

// ==========================================
// 1. STARTUP — Validate Required Env Vars
// ==========================================
// Crash fast if critical config is missing so we know immediately at startup
// rather than getting cryptic errors on the first request.
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
REQUIRED_ENV.forEach(key => {
    if (!process.env[key]) {
        console.error(`FATAL: Missing required environment variable: ${key}`);
        process.exit(1);
    }
});

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// 2. MIDDLEWARE
// ==========================================
app.use(cors({
    origin: process.env.FRONTEND_URL || true, // Allow true for quick dev, set explicit for hardened prod
    credentials: true
}));
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// ==========================================
// 3. ROUTES  (versioned under /api/v1)
// ==========================================
const authRoutes = require('./routes/auth');
const lessonRoutes = require('./routes/lessons');
const assessmentRoutes = require('./routes/assessments');
const aiRoutes = require('./routes/ai');
const placementRoutes = require('./routes/placement');
const reportRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payment');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/lessons', lessonRoutes);
app.use('/api/v1/assessments', assessmentRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/placement', placementRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Legacy aliases so old bookmarks/clients still work
app.use('/api/auth', authRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/assessments', assessmentRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'SIMPLISH LMS API is running', version: 'v1' });
});

// Serve uploaded static files — force PDFs inline so browsers embed them
app.use('/uploads', (req, res, next) => {
    if (req.path.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
    }
    next();
}, express.static(path.join(__dirname, 'uploads')));

// ==========================================
// 4. ERROR HANDLING
// ==========================================
app.use((err, req, res, next) => {
    const errorLog = `[${new Date().toISOString()}] ${err.stack}\n`;
    fs.appendFileSync('error.log', errorLog);
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong on the server.' });
});

// ==========================================
// 5. SCHEDULED TASKS (CRON JOBS)
// ==========================================
// Schedule the cleanup script to run every day at Midnight (00:00)
cron.schedule('0 0 * * *', () => {
    console.log('--- Triggering daily system cleanup cron job ---');
    dailyCleanup();
});

// ==========================================
// 6. EXPORT & LISTEN
// ==========================================
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`API available at: http://localhost:${PORT}/api/v1`);
    });
}

module.exports = app;
