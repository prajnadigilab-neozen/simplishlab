const Tesseract = require('tesseract.js');

/**
 * Extracts text from an image file.
 * Supports English and Kannada.
 * @param {string} imagePath - Path to the image file.
 * @returns {Promise<string|null>} - Extracted text or null if failed.
 */
exports.extractTextFromImage = async (imagePath) => {
    try {
        console.log(`Starting OCR for: ${imagePath}`);
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng+kan', // Support English and Kannada
            {
                logger: m => console.log(`[OCR Progress] ${m.status}: ${Math.round(m.progress * 100)}%`)
            }
        );
        console.log('OCR Extraction Complete.');
        return text.trim();
    } catch (error) {
        console.error("OCR Error:", error);
        return null;
    }
};
