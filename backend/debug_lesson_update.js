const axios = require('axios');

async function debugUpdate() {
    const lessonId = '30806802-c3ca-42db-87fb-a02a77338516';
    const url = `http://localhost:5000/api/v1/lessons/${lessonId}`;

    console.log(`Updating lesson: ${url}`);

    try {
        const response = await axios.put(url, {
            title: "Updated Title",
            description: "Updated Description",
            level: "Basic",
            mediaType: "Video",
            displayOrder: 1
        });
        console.log('Success:', response.status, response.data);
    } catch (error) {
        console.error('Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Error Message:', error.message);
        }
    }
}

debugUpdate();
