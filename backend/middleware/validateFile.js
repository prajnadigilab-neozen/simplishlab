const fs = require('fs');
const path = require('path');

/**
 * Middleware to validate file signatures (magic bytes) after upload.
 * Deletes the file if the signature doesn't match common allowed types.
 */
module.exports = async (req, res, next) => {
    if (!req.file) return next();

    try {
        // file-type is ESM, use dynamic import
        const { fileTypeFromFile } = await import('file-type');
        const type = await fileTypeFromFile(req.file.path);

        // Allowed MIME types based on the upload middleware's extension filter
        const allowedMimeTypes = [
            'application/pdf',
            'audio/mpeg',
            'audio/wav',
            'audio/ogg',
            'audio/aac',
            'video/mp4',
            'video/webm',
            'video/x-msvideo',
            'image/png',
            'image/jpeg',
            'image/bmp',
            'image/webp',
            'image/gif'
        ];

        if (!type || !allowedMimeTypes.includes(type.mime)) {
            // Delete the malicious/invalid file
            fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                message: 'Security Violation: File signature does not match its extension. Upload blocked.' 
            });
        }

        next();
    } catch (err) {
        console.error('File Validation Error:', err);
        // Fallback to safety: if validation fails, remove file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Error validating file upload signature' });
    }
};
