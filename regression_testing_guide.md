# SIMPLISH LMS: REGRESSION TESTING STRATEGY

## Scenario: Adding OCR to Assessment Logic
When adding the OCR feature, we must ensure that "Old Lesson Progress" (MCQ, Text-only lessons) remains intact and functional.

### 1. Logic Explanation
Regression testing is about verifying that new changes haven't "regressed" or broken existing features. In our LMS:
- **Database integrity**: Does the new `Image` question type break existing records?
- **Logic paths**: Does the scoring engine still handle non-OCR questions correctly?

### 2. Manual Regression Steps
1. **Pre-Check**: Note the progress of a sample user (e.g., User A is at 65% in "Basic Conversations").
2. **Feature Deployment**: Deploy the OCR code changes.
3. **Old Content Verification**: Login as User A and verify that:
    - The "Basic Conversations" lesson still loads.
    - The MCQ results are still visible in the dashboard.
    - The user can still start and complete a standard MCQ quiz.
4. **Data Audit**: Check the `assessment_results` table to ensure old rows weren't modified or corrupted.

### 3. Automated Regression Steps
We should add the following tests to our `scoring.test.js`:

```javascript
test('should still handle MCQ correctly after adding OCR capability', () => {
    const mcqQuestion = [{ id: 'mcq1', question_type: 'MCQ', correct_answer: 'A', points: 10 }];
    const result = scoring.calculateScore(mcqQuestion, { mcq1: 'A' });
    expect(result.score).toBe(100);
});

test('should handle OCR extraction results as string comparison', () => {
    const ocrQuestion = [{ id: 'ocr1', question_type: 'Image', correct_answer: 'Hello World', points: 10 }];
    // Simulate text extracted from an image
    const extractedText = "Hello World "; 
    const result = scoring.calculateScore(ocrQuestion, { ocr1: extractedText });
    expect(result.score).toBe(100);
});
```

### 4. Database Migrations
Always use **MIGRATION scripts** for schema changes. If you add a column, ensure it has a `DEFAULT` or allows `NULL` so existing rows don't break.
- Example: `ALTER TABLE questions ADD COLUMN ocr_status TEXT DEFAULT 'pending';`
