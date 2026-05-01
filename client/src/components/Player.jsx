import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Volume2, Maximize2, ListMusic, Heart } from 'lucide-react';
import { useMusicStore } from '../store/useMusicStore';
import HeartBurst from './HeartBurst';

const Player = () => {
  const { 
    currentSong, isPlaying, togglePlay, currentTime, duration, volume, setVolume,
    seekTo, playNext, playPrevious, likedSongs, toggleFavorite, addToHistory 
  } = useMusicStore();
  const [isBursting, setIsBursting] = useState(false);
  const API_URL = 'http://localhost:3000';
  const lastTrackRef = useRef(null);

  useEffect(() => {
    if (currentSong && currentSong._id !== lastTrackRef.current) {
      addToHistory(currentSong._id);
      lastTrackRef.current = currentSong._id;
    }
  }, [currentSong, addToHistory]);

  const handleLike = () => {

    setIsBursting(false);
    setTimeout(() => {
      setIsBursting(true);
      toggleFavorite(currentSong._id);
    }, 10);
  };
  
  // ... rest of the component

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const progress = (currentTime / duration) * 100 || 0;

  if (!currentSong) return (
    <div className="glass-effect" style={{
      position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '90px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 var(--space-xl)', borderTop: '1px solid var(--border-subtle)', zIndex: 1000,
      color: 'var(--text-muted)', fontSize: '14px'
    }}>
      Choose a song to start listening...
    </div>
  );

  return (
    <div className="glass-effect" style={{
      position: 'fixed', bottom: 0, left: 0, width: '100vw', height: '90px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 var(--space-xl)', borderTop: '1px solid var(--border-subtle)', zIndex: 1000
    }}>
      {/* Current Song Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '30%' }}>
        <img 
          src={`${API_URL}/${currentSong.coverImageUrl}`} 
          alt={currentSong.title}
          style={{ width: '56px', height: '56px', borderRadius: '4px', objectFit: 'cover', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
        />
        <div style={{ overflow: 'hidden' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '2px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentSong.title}
          </h4>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{currentSong.artist}</p>
        </div>
        <div style={{ position: 'relative' }}>
          <HeartBurst trigger={isBursting} />
          <button 
            onClick={handleLike}
            style={{
              background: 'none',
              border: 'none',
              color: likedSongs.includes(currentSong._id) ? '#ec4899' : 'var(--text-muted)',
              cursor: 'pointer',
              marginLeft: '10px',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Heart size={18} fill={likedSongs.includes(currentSong._id) ? '#ec4899' : 'none'} />
          </button>
        </div>

      </div>

      {/* Controls */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
          <Shuffle size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
          <SkipBack onClick={playPrevious} size={22} style={{ fill: 'currentColor', cursor: 'pointer' }} />
          
          <div 
            onClick={togglePlay}
            className="play-button-accent" 
            style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'white', color: 'black', borderRadius: '50%', cursor: 'pointer' }}
          >
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" style={{ marginLeft: '2px' }} />}
          </div>

          <SkipForward onClick={playNext} size={22} style={{ fill: 'currentColor', cursor: 'pointer' }} />
          <Repeat size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
        </div>
        
        {/* Progress Bar Container */}
        <div style={{ width: '100%', maxWidth: '500px', display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '35px' }}>{formatTime(currentTime)}</span>
          <div 
            onClick={handleSeek}
            style={{
              flex: 1, height: '4px', backgroundColor: 'var(--bg-elevated)', borderRadius: '2px', cursor: 'pointer', position: 'relative'
            }}
          >
             <div style={{
               width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent-primary)', borderRadius: '2px'
             }} />
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', minWidth: '35px' }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', width: '30%', justifyContent: 'flex-end' }}>
        <ListMusic size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', minWidth: '120px' }}>
          <Volume2 size={18} style={{ color: 'var(--text-secondary)' }} />
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            style={{
              flex: 1, height: '4px', cursor: 'pointer', accentColor: 'var(--accent-primary)'
            }}
          />
        </div>
        <Maximize2 size={18} style={{ color: 'var(--text-secondary)', cursor: 'pointer' }} />
      </div>
    </div>
  );
};

export default Player;
