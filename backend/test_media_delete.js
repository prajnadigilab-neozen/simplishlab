const mediaService = require('./services/mediaService');
const fs = require('fs');
const path = require('path');

async function testDelete() {
    const filename = 'test-delete-file.txt';
    const filePath = path.join(__dirname, 'uploads', filename);

    // Create dummy file
    if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
    }
    fs.writeFileSync(filePath, 'test content');
    console.log(`Created test file: ${filePath}`);

    // Test delete through service
    console.log('Attempting deletion via MediaService...');
    await mediaService.deleteFile(`/uploads/${filename}`);

    if (!fs.existsSync(filePath)) {
        console.log('✅ SUCCESS: File was deleted correctly.');
    } else {
        console.error('❌ FAILURE: File still exists.');
    }
}

testDelete();
