const fs = require('fs');
const path = require('path');

/**
 * MediaService Abstraction
 * Currently handles local filesystem storage.
 * Easily swappable for S3 or Cloudinary.
 */
class MediaService {
    constructor() {
        this.uploadPath = path.join(__dirname, '../uploads');
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    /**
     * Get accessible URL for a filename
     */
    getUrl(filename) {
        if (!filename) return null;
        // In local dev, this is the relative path from the server
        return `/uploads/${filename}`;
    }

    /**
     * Delete a file from storage
     */
    async deleteFile(filename) {
        if (!filename) return;
        const filePath = path.join(this.uploadPath, filename.replace('/uploads/', ''));
        try {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`MediaService: Deleted ${filename}`);
            }
        } catch (err) {
            console.error(`MediaService: Failed to delete ${filename}:`, err.message);
        }
    }

    /**
     * Future: Implement uploadToCloud(file)
     */
}

module.exports = new MediaService();
