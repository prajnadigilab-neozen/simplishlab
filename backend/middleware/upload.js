/**
 * Shared Multer upload middleware.
 * Replaces the duplicate Multer configs that were spread across
 * server.js, routes/lessons.js, and routes/assessments.js.
 */
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = file.originalname ? path.extname(file.originalname) : '';
        cb(null, file.fieldname + '-' + unique + ext);
    }
});

const fileFilter = (req, file, cb) => {
    // Extended list of allowed formats for lesson media
    // Audio: mp3, wav, mpeg, ogg, aac
    // Image: png, jpg, jpeg, bmp, webp, gif
    // Video: mp4, webm, avi
    // Doc: pdf
    const allowed = /pdf|mpeg|wav|mp3|ogg|aac|mp4|webm|avi|png|jpg|jpeg|bmp|webp|gif/;
    const ext = file.originalname ? path.extname(file.originalname).toLowerCase() : '';
    if (ext && allowed.test(ext)) {
        return cb(null, true);
    }
    cb(new Error('Invalid file type! Allowed: PDF, Audio (mp3, wav, etc.), Video (mp4, etc.), Image (png, jpg, bmp, etc.)'));
};

// Export the multer instance — callers use upload.single(), upload.any(), etc.
module.exports = multer({ storage, fileFilter });
