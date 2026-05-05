import React, { useEffect, useRef } from 'react';
import { useMusicStore } from '../store/useMusicStore';

const AudioController = () => {
  const audioRef = useRef(null);
  const { 
    currentSong, 
    isPlaying, 
    volume, 
    currentTime,
    setCurrentTime, 
    setDuration, 
    togglePlay,
    requestedSeekTime,
    playNext
  } = useMusicStore();

  const API_URL = 'http://192.168.1.14:3000';
  const hasRestoredSession = useRef(false);

  // Restore Session on Mount
  useEffect(() => {
    if (!hasRestoredSession.current && audioRef.current && currentSong && currentTime > 0) {
      // Set the source manually for rehydration
      audioRef.current.src = currentSong.audioUrl.startsWith('http') ? currentSong.audioUrl : `${API_URL}/${currentSong.audioUrl}`;
      audioRef.current.currentTime = currentTime;
      hasRestoredSession.current = true;
    }
  }, [currentSong]);

  // Handle Seeking
  useEffect(() => {
    if (requestedSeekTime !== null && audioRef.current) {
      audioRef.current.currentTime = requestedSeekTime;
      // Reset seek time to null so it doesn't trigger again
      useMusicStore.setState({ requestedSeekTime: null });
    }
  }, [requestedSeekTime]);

  // Handle Play/Pause
  useEffect(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error("Playback error:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);

  // Handle Song Change
  useEffect(() => {
    if (!audioRef.current || !currentSong) return;
    
    // Construct the full URL
    // audioUrl in DB is like 'uploads/songs/...' or an absolute URL
    const audioSrc = currentSong.audioUrl.startsWith('http') ? currentSong.audioUrl : `${API_URL}/${currentSong.audioUrl}`;
    audioRef.current.src = audioSrc;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => console.error("Source change playback error:", err));
    }
  }, [currentSong]);

  // Handle Volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleEnded = () => {
    playNext();
  };

  return (
    <audio
      ref={audioRef}
      onTimeUpdate={handleTimeUpdate}
      onLoadedMetadata={handleLoadedMetadata}
      onEnded={handleEnded}
      hidden
    />
  );
};

export default AudioController;
