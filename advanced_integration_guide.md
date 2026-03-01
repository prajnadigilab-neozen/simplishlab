# SIMPLISH LMS: ADVANCED INTEGRATION GUIDE

## 1. Voice Recording API (Verbal Answers)

### Logic Explanation
To master verbal English, students need to record their voices. We use the browser's **MediaRecorder API** because it's native, requires no libraries, and handles the microphone stream securely.

### Implementation Steps
1. **Request Permission**: Use `navigator.mediaDevices.getUserMedia({ audio: true })`.
2. **Start Recording**: Create a `MediaRecorder` instance and push data chunks into an array.
3. **Stop & Export**: Convert chunks into a `Blob` (WebM/WAV) and send it to the backend.

### Code Snippet (Frontend)
```javascript
// frontend/src/utils/voiceRecorder.js
export const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    const audioChunks = [];

    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    return { mediaRecorder, audioChunks };
};

export const stopRecording = (mediaRecorder, audioChunks) => {
    return new Promise((resolve) => {
        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            resolve(audioBlob);
        };
        mediaRecorder.stop();
    });
};
```

---

## 2. OCR Pipeline (Image-to-Text)

### Logic Explanation
To convert written Kannada/English notes into text, we use an **OCR Pipeline**.
1. **Image Pre-processing**: (Optional) Use Canvas to grayscale or increase contrast to improve accuracy.
2. **OCR Engine**: We use **Tesseract.js** (a port of the famous Tesseract engine) which runs in the browser or Node.js.
3. **Validation**: The extracted text is then sent to the scoring logic we built in Step 2.

### Code Snippet (Backend Integration)
To implement this on the server, install `tesseract.js`:
`npm install tesseract.js`

```javascript
// backend/utils/ocr.js
const Tesseract = require('tesseract.js');

exports.extractTextFromImage = async (imagePath) => {
    try {
        const { data: { text } } = await Tesseract.recognize(
            imagePath,
            'eng+kan', // Support both English and Kannada
            { logger: m => console.log(m) }
        );
        return text.trim();
    } catch (error) {
        console.error("OCR Error:", error);
        return null;
    }
};
```

### Integration Workflow
1. User uploads an image via the Assessment UI.
2. Frontend sends it to `/api/assessments/submit` as a file.
3. Backend saves the file, runs `extractTextFromImage`, and then compares the result with `correct_answer`.
