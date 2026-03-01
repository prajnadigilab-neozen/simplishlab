import React, { useState } from 'react';
import { Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ImageUpload = ({ onImageSelected }) => {
    const [preview, setPreview] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);
            onImageSelected(file);
        }
    };

    const clear = () => {
        setPreview(null);
        onImageSelected(null);
    };

    return (
        <div className="flex flex-col items-center gap-4 p-4 glass-card border-dashed">
            {!preview ? (
                <label style={{ cursor: 'pointer', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', items: 'center', gap: '1rem', padding: '2rem' }}>
                        <ImageIcon size={48} color="var(--primary)" style={{ margin: '0 auto' }} />
                        <div>
                            <p style={{ fontWeight: 'bold' }}>ಬರೆದ ಉತ್ತರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>(Upload written answer image)</p>
                        </div>
                    </div>
                    <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                </label>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ position: 'relative', width: '100%' }}
                >
                    <img src={preview} alt="Preview" style={{ width: '100%', borderRadius: '0.5rem', maxHeight: '300px', objectFit: 'contain' }} />
                    <button
                        onClick={clear}
                        style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            padding: '0.5rem',
                            cursor: 'pointer'
                        }}
                    >
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </div>
    );
};

export default ImageUpload;
