import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMusicStore } from '../store/useMusicStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect } from 'react';
import { X, Upload, Music, Image as ImageIcon, CheckCircle } from 'lucide-react';

const EditSongModal = ({ isOpen, onClose, songToEdit }) => {
  const { updateSong, loading, error, uploadProgress } = useMusicStore();
  const { user } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'Lo-Fi',
    album: '',
  });

  useEffect(() => {
    if (isOpen && songToEdit) {
      setFormData({
        title: songToEdit.title || '',
        artist: songToEdit.artist || '',
        genre: songToEdit.genre || 'Lo-Fi',
        album: songToEdit.album || '',
      });
    }
  }, [isOpen, songToEdit]);

  const [files, setFiles] = useState({
    audio: null,
    cover: null,
  });
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('artist', formData.artist);
    data.append('genre', formData.genre);
    data.append('album', formData.album);
    if (files.audio) data.append('audio', files.audio);
    if (files.cover) data.append('cover', files.cover);

    try {
      await updateSong(songToEdit._id, data);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        // Reset form
        setFormData({ title: '', artist: '', genre: 'Lo-Fi', album: '' });
        setFiles({ audio: null, cover: null });
      }, 2000);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2500,
        padding: '20px'
      }} onClick={onClose}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-effect"
          style={{
            width: '100%',
            maxWidth: '500px',
            borderRadius: '24px',
            padding: '40px',
            position: 'relative',
            border: '1px solid var(--border-bright)'
          }}
        >
          {success ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ marginBottom: '20px' }}>
                <CheckCircle size={64} color="var(--accent-secondary)" style={{ margin: '0 auto' }} />
              </motion.div>
              <h2 style={{ fontSize: '24px', color: 'white' }}>Song Uploaded Successfully!</h2>
              <p style={{ color: 'var(--text-muted)' }}>Redirecting to dashboard...</p>
            </div>
          ) : (
            <>
              <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={24} />
              </button>

              <h2 style={{ fontSize: '28px', color: 'white', marginBottom: '8px' }}>Edit Song</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Update song metadata or replace files.</p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <input 
                  className="glass-effect"
                  placeholder="Song Title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', outline: 'none' }}
                />

                <input 
                  className="glass-effect"
                  placeholder="Artist Name"
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                  required
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', backgroundColor: 'rgba(255,255,255,0.05)', outline: 'none' }}
                />

                <select 
                  className="glass-effect"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value})}
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid var(--glass-border)', color: 'white', backgroundColor: 'rgba(255,255,255,0.1)', outline: 'none' }}
                >
                  <option value="Lo-Fi">Lo-Fi</option>
                  <option value="House">House</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Rock">Rock</option>
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept="audio/*" 
                      id="audio-upload"
                      onChange={(e) => setFiles({...files, audio: e.target.files[0]})}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="audio-upload" style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', 
                      borderRadius: '16px', border: '2px dashed var(--glass-border)', cursor: 'pointer',
                      backgroundColor: files.audio ? 'rgba(139,92,246,0.1)' : 'transparent',
                      transition: 'all 0.3s'
                    }}>
                      <Music size={24} color={files.audio ? 'var(--accent-primary)' : 'var(--text-muted)'} />
                      <span style={{ fontSize: '12px', marginTop: '8px', color: files.audio ? 'white' : 'var(--text-muted)' }}>
                        {files.audio ? files.audio.name.substring(0, 15) + '...' : 'MP3 File'}
                      </span>
                    </label>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      id="cover-upload"
                      onChange={(e) => setFiles({...files, cover: e.target.files[0]})}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="cover-upload" style={{ 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', 
                      borderRadius: '16px', border: '2px dashed var(--glass-border)', cursor: 'pointer',
                      backgroundColor: files.cover ? 'rgba(34,197,94,0.1)' : 'transparent',
                      transition: 'all 0.3s'
                    }}>
                      <ImageIcon size={24} color={files.cover ? 'var(--accent-secondary)' : 'var(--text-muted)'} />
                      <span style={{ fontSize: '12px', marginTop: '8px', color: files.cover ? 'white' : 'var(--text-muted)' }}>
                        {files.cover ? files.cover.name.substring(0, 15) + '...' : 'Cover Image'}
                      </span>
                    </label>
                  </div>
                </div>

                {error && <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

                {loading && (
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginTop: '10px' }}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-secondary))' }} 
                    />
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    marginTop: '10px', padding: '14px', borderRadius: '12px', border: 'none', color: 'white', fontWeight: '700',
                    background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
                  }}
                >
                  {loading ? `Updating ${uploadProgress}%...` : 'Update Song'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EditSongModal;
