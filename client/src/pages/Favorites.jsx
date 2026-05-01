import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMusicStore } from '../store/useMusicStore';
import { Heart, Play, Clock, Music, Trash2, Calendar } from 'lucide-react';

const Favorites = () => {
  const { favoriteSongs, fetchFavorites, setCurrentSong, toggleFavorite, isPlaying, currentSong } = useMusicStore();
  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.1) 0%, var(--bg-deep) 400px)',
      minHeight: '100%',
    }}>
      {/* Hero Header Section */}
      <section style={{
        padding: '60px 32px 32px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '32px',
        background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, transparent 100%)'
      }}>
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          style={{
            width: '232px',
            height: '232px',
            background: 'linear-gradient(135deg, #450aef 0%, #c159ed 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <Heart size={90} fill="white" color="white" />
        </motion.div>

        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>Playlist</span>
          <h1 style={{ fontSize: '96px', fontWeight: '900', color: 'white', margin: '-10px 0 10px -4px', letterSpacing: '-4px' }}>Liked Songs</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px', fontWeight: '500' }}>
            <span style={{ color: 'white' }}>{localStorage.getItem('userName') || 'Your Collection'}</span>
            <span>•</span>
            <span>{favoriteSongs.length} songs</span>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '32px' }}>
        <button 
          onClick={() => favoriteSongs[0] && handlePlaySong(favoriteSongs[0])}
          className="play-button-accent"
          style={{ width: '56px', height: '56px' }}
        >
          <Play size={24} fill="white" style={{ marginLeft: '4px' }} />
        </button>
      </div>

      {/* Songs Table Container */}
      <div style={{ padding: '0 32px 100px', flex: 1 }}>
        <div className="glass-effect" style={{ borderRadius: '12px', padding: '16px', border: '1px solid var(--border-subtle)' }}>
          {favoriteSongs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Music size={64} style={{ opacity: 0.1, margin: '0 auto 20px' }} />
              <h3>No liked songs yet</h3>
              <p>Start clicking the heart icon to build your library!</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <th style={{ padding: '12px', width: '40px' }}>#</th>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Album</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}><Clock size={16} style={{ display: 'inline' }} /></th>
                </tr>
              </thead>
              <tbody>
                {favoriteSongs.map((song, index) => {
                  const isCurrent = currentSong?._id === song._id;
                  return (
                    <motion.tr 
                      key={song._id}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => handlePlaySong(song)}
                      style={{ cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s' }}
                    >
                      <td style={{ padding: '12px', color: isCurrent ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '14px' }}>
                        {isCurrent && isPlaying ? (
                          <div style={{ width: '12px', height: '12px', border: '2px solid var(--accent-primary)', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                        ) : index + 1}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={`${API_URL}/${song.coverImageUrl}`} 
                            alt={song.title} 
                            style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ color: isCurrent ? 'var(--accent-primary)' : 'white', fontWeight: '600', fontSize: '14px' }}>{song.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{song.artist}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        {song.album || 'Single'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(song._id);
                          }}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', opacity: 0.6 }}
                          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.6}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites;

