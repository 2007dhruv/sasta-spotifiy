import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Play, Trash2, Calendar } from 'lucide-react';
import { useMusicStore } from '../store/useMusicStore';

const History = () => {
  const { history, fetchHistory, setCurrentSong, isPlaying, currentSong } = useMusicStore();
  const API_URL = 'http://localhost:3000';

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const playedAt = new Date(dateString);
    const diffInSeconds = Math.floor((now - playedAt) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  return (
    <div style={{ padding: 'var(--space-xl)', color: 'white' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'flex-end', gap: '24px' }}>
        <div className="glass-effect" style={{ width: '192px', height: '192px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.4)' }}>
          <Clock size={80} color="var(--accent-primary)" />
        </div>
        <div>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Library</span>
          <h1 style={{ fontSize: '72px', fontWeight: '800', margin: '4px 0 12px -4px', letterSpacing: '-2px' }}>History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Your recent listening sessions</p>
        </div>
      </header>

      <div className="glass-effect" style={{ borderRadius: '12px', overflow: 'hidden', padding: '24px' }}>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <h3>No history yet</h3>
            <p>Songs you listen to will appear here.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px', width: '40px' }}>#</th>
                <th style={{ padding: '12px' }}>Title</th>
                <th style={{ padding: '12px' }}>Album</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Played At</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => {
                const song = entry.song;
                if (!song) return null;
                const isCurrent = currentSong?._id === song._id;

                return (
                  <motion.tr 
                    key={`${song._id}-${entry.playedAt}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                    onClick={() => handlePlaySong(song)}
                    style={{ cursor: 'pointer', borderRadius: '8px' }}
                  >
                    <td style={{ padding: '12px', color: isCurrent ? 'var(--accent-secondary)' : 'var(--text-muted)', fontSize: '14px' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img 
                          src={`${API_URL}/${song.coverImageUrl}`} 
                          alt={song.title} 
                          style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ color: isCurrent ? 'var(--accent-secondary)' : 'white', fontWeight: '600', fontSize: '14px' }}>{song.title}</div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{song.artist}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                      {song.album || 'Single'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {formatTimeAgo(entry.playedAt)}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default History;
