import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useMusicStore } from '../store/useMusicStore';
import { Play, Clock, Music, Trash2, ListMusic, ChevronLeft } from 'lucide-react';
import ConfirmModal from '../components/ConfirmModal';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activePlaylist, fetchPlaylistDetail, setCurrentSong, removeSongFromPlaylist, isPlaying, currentSong, deletePlaylist, loading, showToast } = useMusicStore();
  const API_URL = 'http://192.168.1.14:3000';
  const [error, setError] = React.useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  useEffect(() => {
    const loadPlaylist = async () => {
      try {
        await fetchPlaylistDetail(id);
      } catch (err) {
        setError(true);
      }
    };
    loadPlaylist();
  }, [id, fetchPlaylistDetail]);

  const handlePlaySong = (song) => {
    setCurrentSong(song);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deletePlaylist(id);
      navigate('/');
    } catch (err) {
      // Handled by store
    }
  };


  if (error) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="glass-effect" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
        <p>Could not load playlist. It might have been deleted.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '12px', color: 'var(--accent-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Go Home</button>
      </div>
    </div>
  );

  if (!activePlaylist && loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="glass-effect" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }} />
        <p>Loading playlist...</p>
      </div>
    </div>
  );

  if (!activePlaylist) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
      <div className="glass-effect" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
        <p>Playlist not found.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: '12px', color: 'var(--accent-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>Go Home</button>
      </div>
    </div>
  );

  const songs = activePlaylist.songs || [];
  const firstSongCover = songs.length > 0 ? songs[0].coverImageUrl : null;

  return (
    <div style={{
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, var(--bg-deep) 400px)',
      minHeight: '100%',
    }}>
      {/* Header */}
      <div style={{ padding: '20px 32px' }}>
         <button onClick={() => navigate(-1)} className="glass-effect" style={{ padding: '8px', borderRadius: '50%', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
           <ChevronLeft size={20} />
         </button>
      </div>

      {/* Hero Section */}
      <section className="hero-flex" style={{
        padding: '20px 32px 32px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '32px',
      }}>
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: '232px',
            height: '232px',
            background: firstSongCover ? `url(${firstSongCover.startsWith('http') ? firstSongCover : `${API_URL}/${firstSongCover}`})` : 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {!firstSongCover && <ListMusic size={80} color="rgba(255,255,255,0.2)" />}
        </motion.div>

        <div style={{ flex: 1 }}>
          <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: 'white' }}>Private Playlist</span>
          <h1 style={{ fontSize: '72px', fontWeight: '900', color: 'white', margin: '-5px 0 10px -4px', letterSpacing: '-2px' }}>{activePlaylist.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
            <span style={{ color: 'white', fontWeight: '600' }}>Playlist Owner</span>
            <span>•</span>
            <span>{songs.length} songs</span>
          </div>
        </div>
      </section>

      {/* Action Bar */}
      <div style={{ padding: '24px 32px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button 
          onClick={() => songs[0] && handlePlaySong(songs[0])}
          className="play-button-accent"
          style={{ width: '56px', height: '56px', backgroundColor: 'var(--accent-secondary)' }}
        >
          <Play size={24} fill="white" style={{ marginLeft: '4px' }} />
        </button>
        
        <button 
          onClick={() => setIsDeleteModalOpen(true)}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: '0.2s' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          <Trash2 size={24} />
        </button>

        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Delete Playlist"
          message={`Are you sure you want to delete "${activePlaylist?.name}"? This action cannot be undone.`}
          confirmText="Delete"
        />
      </div>

      {/* Table */}
      <div style={{ padding: '0 32px 100px' }}>
        <div className="glass-effect" style={{ borderRadius: '12px', padding: '16px' }}>
          {songs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
              <Music size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
              <p>This playlist is empty</p>
              <button onClick={() => navigate('/')} style={{ marginTop: '12px', color: 'var(--accent-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Add some songs!</button>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase' }}>
                  <th style={{ padding: '12px', width: '40px' }}>#</th>
                  <th style={{ padding: '12px' }}>Title</th>
                  <th style={{ padding: '12px' }}>Album</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}><Clock size={16} style={{ display: 'inline' }} /></th>
                </tr>
              </thead>
              <tbody>
                {songs.map((song, index) => {
                  const sId = song._id?.toString() || song.id?.toString();
                  const isCurrent = currentSong?._id?.toString() === sId || currentSong?.id?.toString() === sId;
                  
                  return (
                    <motion.tr 
                      key={sId || index}
                      whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                      onClick={() => {
                        console.log('Playing song:', song);
                        handlePlaySong(song);
                      }}
                      style={{ cursor: 'pointer', borderRadius: '8px' }}
                    >
                      <td style={{ padding: '12px', color: isCurrent ? 'var(--accent-secondary)' : 'var(--text-muted)', fontSize: '14px' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img 
                            src={song.coverImageUrl ? (song.coverImageUrl.startsWith('http') ? song.coverImageUrl : `${API_URL}/${song.coverImageUrl}`) : '/default-cover.png'} 
                            onError={(e) => { e.target.src = '/default-cover.png'; e.target.onerror = null; }}
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
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSongFromPlaylist(id, sId);
                          }}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
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

export default PlaylistDetail;
