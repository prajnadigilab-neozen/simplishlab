import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, CheckCircle2, XCircle, Loader2, ArrowLeft, Plus, HelpCircle, Edit, Trash2 } from 'lucide-react';
import { lessonApi, assessmentApi } from '../utils/api';

const LessonCreate = ({ lesson, onBack }) => {
    const [currentTab, setCurrentTab] = useState('details'); // 'details', 'media', 'questions'
    const [formData, setFormData] = useState({
        title: '',
        level: 'Basic',
        description: '',
        displayOrder: 1
    });
    const [files, setFiles] = useState({ pdf: null, audio: null, video: null });
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const [newQuestion, setNewQuestion] = useState({ text: '', type: 'Text', correct_answer: '', points: 10, options: '', explanation: '' });
    const [editingQuestionIdx, setEditingQuestionIdx] = useState(null);

    useEffect(() => {
        // Reset form state whenever the lesson prop changes
        setStatus('idle');
        setMessage('');
        setFiles({ pdf: null, audio: null, video: null });
        setQuestions([]);
        setCurrentTab('details');

        if (lesson) {
            setFormData({
                title: lesson.title || '',
                level: lesson.level || 'Basic',
                description: lesson.description || '',
                displayOrder: lesson.display_order || 1
            });
            fetchQuestions(lesson.id);
        } else {
            // Reset to blank form for new lesson
            setFormData({
                title: '',
                level: 'Basic',
                description: '',
                displayOrder: 1
            });
        }
    }, [lesson]);

    const fetchQuestions = async (lessonId) => {
        setLoadingQuestions(true);
        try {
            const res = await assessmentApi.getByLesson(lessonId);
            const fetchedQuestions = res.data.questions || [];
            setQuestions(fetchedQuestions.map(q => ({
                id: q.id,
                text: q.text,
                type: q.type,
                correct_answer: q.correct_answer,
                points: q.points || 10,
                options: q.options ? q.options.join(', ') : '',
                explanation: q.explanation || ''
            })));
        } catch (err) {
            console.warn("No assessment found for this lesson yet.");
            setQuestions([]);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleAddQuestion = () => {
        if (!newQuestion.text || !newQuestion.correct_answer) {
            alert('ದಯವಿಟ್ಟು ಪ್ರಶ್ನೆ ಮತ್ತು ಸರಿಯಾದ ಉತ್ತರವನ್ನು ಭರ್ತಿ ಮಾಡಿ (Please fill in both Question Text and Correct Answer)');
            return;
        }

        const preparedQuestion = {
            ...newQuestion,
            options: newQuestion.type === 'MCQ'
                ? newQuestion.options.split(',').map(o => o.trim()).filter(o => o !== '')
                : null
        };

        if (editingQuestionIdx !== null) {
            const updated = [...questions];
            updated[editingQuestionIdx] = preparedQuestion;
            setQuestions(updated);
            setEditingQuestionIdx(null);
        } else {
            setQuestions([...questions, preparedQuestion]);
        }
        setNewQuestion({ text: '', type: 'Text', correct_answer: '', points: 10, options: '', explanation: '' });
    };

    const handleEditQuestion = (index) => {
        const q = questions[index];
        setNewQuestion({
            ...q,
            options: Array.isArray(q.options) ? q.options.join(', ') : (q.options || '')
        });
        setEditingQuestionIdx(index);
    };

    const handleDeleteQuestion = (index) => {
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setStatus('loading');

        try {
            // 1. Save/Update Lesson
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            if (files.pdf) data.append('pdf', files.pdf);
            if (files.audio) data.append('audio', files.audio);
            if (files.video) data.append('video', files.video);

            if (lesson) {
                if (lesson.pdf_url) data.append('pdfUrl', lesson.pdf_url);
                if (lesson.audio_url) data.append('audioUrl', lesson.audio_url);
                if (lesson.video_url) data.append('videoUrl', lesson.video_url);
            }

            let lessonId = lesson?.id;
            if (lesson) {
                await lessonApi.update(lesson.id, data);
            } else {
                const res = await lessonApi.upload(data);
                lessonId = res.data?.lesson?.id || res.data?.id;

                if (!lessonId) {
                    throw new Error("Failed to retrieve new Lesson ID from server response.");
                }
            }

            // 2. Save/Update Questions (Assessment)
            // Even if empty, we might want to "sync" to clear questions if they were deleted
            await assessmentApi.upsertQuestions(lessonId, questions);

            setMessage(lesson ? 'Lesson & Questions updated!' : 'Lesson & Questions saved!');
            setStatus('success');
            setTimeout(() => {
                setStatus('idle');
                onBack();
            }, 1500);
        } catch (err) {
            console.error('Detailed Save Error:', err);
            console.error('Error config URL:', err?.config?.url);
            console.error('Error response data:', err?.response?.data);
            setStatus('error');
            setMessage(`Failed to save. ${err?.response?.data?.message || err.message}`);
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            const lines = text.split('\n');
            const newQuestions = [];

            for (let i = 1; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;

                const row = line.match(/(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|([^,]+))/g);
                if (!row || row.length < 3) continue;

                const cleanRow = row.map(cell => {
                    let c = cell.trim();
                    if (c.endsWith(',')) c = c.slice(0, -1).trim();
                    if (c.startsWith('"') && c.endsWith('"')) c = c.slice(1, -1).replace(/""/g, '"');
                    return c;
                });

                const type = cleanRow[0] || 'Text';
                const textQ = cleanRow[1] || '';
                const options = [];
                if (cleanRow[2]) options.push(cleanRow[2]);
                if (cleanRow[3]) options.push(cleanRow[3]);
                if (cleanRow[4]) options.push(cleanRow[4]);
                if (cleanRow[5]) options.push(cleanRow[5]);

                const correct_answer = cleanRow[6] || cleanRow[2] || '';
                const points = parseInt(cleanRow[7]) || 10;
                const explanation = cleanRow[8] || '';

                if (textQ && correct_answer) {
                    newQuestions.push({
                        text: textQ,
                        type,
                        options: type === 'MCQ' ? options : null,
                        correct_answer,
                        points,
                        explanation
                    });
                }
            }
            if (newQuestions.length > 0) {
                setQuestions(prev => [...prev, ...newQuestions]);
                alert(`Successfully imported ${newQuestions.length} questions.`);
            } else {
                alert('No valid questions found in CSV.');
            }
        };
        reader.readAsText(file);
        e.target.value = null;
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setCurrentTab(id)}
            style={{
                padding: '1rem 2rem',
                border: 'none',
                background: currentTab === id ? 'var(--primary-light)' : 'transparent',
                color: currentTab === id ? 'var(--primary)' : 'var(--text-muted)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                borderBottom: currentTab === id ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s ease'
            }}
        >
            <Icon size={18} />
            {label}
        </button>
    );

    return (
        <div className="max-w-6xl mx-auto p-6" style={{ paddingBottom: '5rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ margin: 0 }}>
                    {lesson ? 'ಪಾಠ ನಿರ್ವಹಣೆ (Manage Lesson)' : 'ಹೊಸ ಪಾಠ ಸೇರಿಸಿ (Add New Lesson)'}
                </h2>
            </header>

            <div className="glass-card" style={{ padding: 0, marginBottom: '2rem', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                    <TabButton id="details" label="1. Details" icon={Plus} />
                    <TabButton id="media" label="2. Multimedia" icon={Upload} />
                    <TabButton id="questions" label="3. Questions" icon={HelpCircle} />
                </div>

                <div style={{ padding: '2.5rem' }}>
                    {currentTab === 'details' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Lesson Title</label>
                                <input
                                    className="glass-card"
                                    style={{ width: '100%', padding: '1rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                    type="text"
                                    placeholder="e.g. Introduction to Greetings"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Learning Level</label>
                                    <select
                                        className="glass-card"
                                        style={{ width: '100%', padding: '1rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                        value={formData.level}
                                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Intermediate">Intermediate</option>
                                        <option value="Advanced">Advanced</option>
                                        <option value="Expert">Expert</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Display Order</label>
                                    <input
                                        type="number"
                                        className="glass-card"
                                        style={{ width: '100%', padding: '1rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                        value={formData.displayOrder}
                                        onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Description</label>
                                <textarea
                                    className="glass-card"
                                    style={{ width: '100%', padding: '1rem', background: 'var(--bg-dark)', border: '1px solid var(--border)', height: '120px' }}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                <button className="btn btn-primary" onClick={() => setCurrentTab('media')} style={{ padding: '0.8rem 3rem' }}>
                                    Next Section: Multimedia →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentTab === 'media' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>
                                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)' }}>
                                    <Upload size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>PDF Content</h4>
                                    <input type="file" accept=".pdf" onChange={(e) => setFiles({ ...files, pdf: e.target.files[0] })} style={{ width: '100%', fontSize: '0.8rem' }} />
                                    {lesson?.pdf_url && <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '1rem' }}>✓ Existing PDF Saved</p>}
                                </div>
                                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)' }}>
                                    <Upload size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Audio Track</h4>
                                    <input type="file" accept="audio/*" onChange={(e) => setFiles({ ...files, audio: e.target.files[0] })} style={{ width: '100%', fontSize: '0.8rem' }} />
                                    {lesson?.audio_url && <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '1rem' }}>✓ Existing Audio Saved</p>}
                                </div>
                                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', border: '2px dashed var(--border)' }}>
                                    <Upload size={32} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                                    <h4 style={{ margin: '0 0 0.5rem 0' }}>Video File</h4>
                                    <input type="file" accept="video/*" onChange={(e) => setFiles({ ...files, video: e.target.files[0] })} style={{ width: '100%', fontSize: '0.8rem' }} />
                                    {lesson?.video_url && <p style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '1rem' }}>✓ Existing Video Saved</p>}
                                </div>
                            </div>

                            {(files.audio || lesson?.audio_url) && (
                                <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                    <img src="https://img.icons8.com/clouds/100/microphone.png" alt="mic" style={{ width: '60px' }} />
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600 }}>Audio Section Active</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>A motivation poster and microphone GIF will be shown to the student.</p>
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                <button className="btn" onClick={() => setCurrentTab('details')} style={{ padding: '0.8rem 2rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}>
                                    ← Back to Details
                                </button>
                                <button className="btn btn-primary" onClick={() => setCurrentTab('questions')} style={{ padding: '0.8rem 3rem' }}>
                                    Next Section: Questions →
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentTab === 'questions' && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
                            <div className="glass-card" style={{ padding: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: 0 }}>Add Question</h3>
                                    <div>
                                        <input type="file" accept=".csv" id="csv-upload" style={{ display: 'none' }} onChange={handleCsvUpload} />
                                        <label htmlFor="csv-upload" className="btn" style={{ background: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem 1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Upload size={16} /> Bulk Upload CSV
                                        </label>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Question Text</label>
                                        <input
                                            className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                            value={newQuestion.text}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Type</label>
                                            <select
                                                className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                                value={newQuestion.type}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                                            >
                                                <option value="Text">Text</option>
                                                <option value="MCQ">MCQ</option>
                                                <option value="Voice">Voice</option>
                                                <option value="Image">Image</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Points</label>
                                            <input
                                                type="number"
                                                className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                                value={newQuestion.points}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    {newQuestion.type === 'MCQ' && (
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Options (comma-separated)</label>
                                            <input
                                                className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                                value={newQuestion.options}
                                                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
                                                placeholder="Choice A, Choice B, Choice C"
                                            />
                                        </div>
                                    )}
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Correct Answer</label>
                                        <input
                                            className="glass-card" style={{ width: '100%', padding: '0.75rem', background: 'var(--bg-dark)', border: '1px solid var(--border)' }}
                                            value={newQuestion.correct_answer}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, correct_answer: e.target.value })}
                                        />
                                    </div>
                                    <button className="btn btn-primary" onClick={handleAddQuestion} style={{ padding: '0.75rem' }}>
                                        {editingQuestionIdx !== null ? 'Update Question' : '+ Add to List'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div className="glass-card" style={{ padding: '1.5rem', maxHeight: '400px', overflowY: 'auto' }}>
                                    <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>Questions List ({questions.length})</h4>
                                    {questions.map((q, idx) => (
                                        <div key={idx} style={{ padding: '1rem', background: 'var(--bg-dark)', border: '1px solid var(--border)', borderRadius: '8px', marginBottom: '0.75rem' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 700 }}>{q.type}</span>
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <Edit size={14} style={{ cursor: 'pointer' }} onClick={() => handleEditQuestion(idx)} />
                                                    <Trash2 size={14} style={{ cursor: 'pointer', color: '#ef4444' }} onClick={() => handleDeleteQuestion(idx)} />
                                                </div>
                                            </div>
                                            <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>{q.text}</p>
                                        </div>
                                    ))}
                                    {questions.length === 0 && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center' }}>No questions added.</p>}
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSubmit()}
                                    disabled={status === 'loading'}
                                    style={{ padding: '1rem', width: '100%', background: 'var(--primary)', boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)' }}
                                >
                                    {status === 'loading' ? <Loader2 className="animate-spin" size={24} /> : 'Finalize & Save Lesson'}
                                </button>
                                <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>All changes will be updated and you'll be returned to Library.</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {status === 'success' && <div style={{ color: '#4ade80', textAlign: 'center' }}>✓ {message}</div>}
            {status === 'error' && <div style={{ color: '#f87171', textAlign: 'center' }}>⚠ {message}</div>}
        </div>
    );
};

export default LessonCreate;
