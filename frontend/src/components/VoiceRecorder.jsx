import React, { useState, useRef } from 'react';
import { Mic, Square, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceRecorder = ({ onRecordingComplete }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const timerRef = useRef(null);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
                const url = URL.createObjectURL(blob);
                setAudioBlob(blob);
                setAudioUrl(url);
                onRecordingComplete(blob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setDuration(0);
            timerRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Please enable microphone access.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            clearInterval(timerRef.current);
        }
    };

    const reset = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setDuration(0);
        onRecordingComplete(null);
    };

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 glass-card">
            <AnimatePresence mode="wait">
                {!audioBlob ? (
                    <motion.div
                        key="recording"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-4"
                    >
                        {isRecording && (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                style={{ width: '12px', height: '12px', background: '#ef4444', borderRadius: '50%' }}
                            />
                        )}
                        <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(duration)}</span>

                        {!isRecording ? (
                            <button
                                className="btn btn-primary"
                                onClick={startRecording}
                                style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0 }}
                            >
                                <Mic size={32} />
                            </button>
                        ) : (
                            <button
                                className="btn"
                                onClick={stopRecording}
                                style={{ width: '64px', height: '64px', borderRadius: '50%', padding: 0, background: '#ef4444' }}
                            >
                                <Square size={32} fill="white" />
                            </button>
                        )}
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                            {isRecording ? "ಸಂಭಾಷಣೆಯನ್ನು ರೆಕಾರ್ಡ್ ಮಾಡಿ (Recording...)" : "ಮಾತನಾಡಲು ಬಟನ್ ಒತ್ತಿ (Press to Speak)"}
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="preview"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center gap-4 w-full"
                    >
                        <audio src={audioUrl} controls className="w-full" style={{ filter: 'invert(1)' }} />
                        <button className="btn" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                            <Trash2 size={18} /> Clear & Retake
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VoiceRecorder;
