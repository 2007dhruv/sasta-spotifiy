import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import AuthModal from './components/AuthModal';
import AdminDashboard from './pages/AdminDashboard';
import Favorites from './pages/Favorites';
import History from './pages/History';
import PlaylistDetail from './pages/PlaylistDetail';
import UploadSongModal from './components/UploadSongModal';
import AudioController from './components/AudioController';
import HeartBurst from './components/HeartBurst';
import Toast from './components/Toast';
import { useAuthStore } from './store/useAuthStore';
import { useMusicStore } from './store/useMusicStore';
import { Heart, Plus, ListMusic, Sparkles } from 'lucide-react';

function App() {
  const navigate = useNavigate();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const { user, isAuthenticated, checkAuth, logout, isCheckingAuth } = useAuthStore();
  const { 
    songs, loading, fetchSongs, setCurrentSong, 
    likedSongs, toggleFavorite, fetchFavorites, 
    playlists, addSongToPlaylist, history, fetchHistory,
    aiRecommendations, fetchAIRecommendations
  } = useMusicStore();

  useEffect(() => {
    checkAuth();
    fetchSongs();
    if (isAuthenticated) {
      fetchFavorites();
      fetchHistory();
      fetchAIRecommendations();
    }
  }, [isAuthenticated, fetchFavorites, fetchHistory, fetchAIRecommendations]);


  if (isCheckingAuth) {
    return (
      <div style={{ 
        width: '100vw', height: '100vh', backgroundColor: 'var(--bg-deep)', 
        display: 'flex', alignItems: 'center', justifyContent: 'center' 
      }}>
        <div className="glass-effect" style={{ padding: '40px', borderRadius: '24px', textAlign: 'center' }}>
          <div style={{ 
            width: '40px', height: '40px', border: '3px solid rgba(255,255,255,0.1)', 
            borderTop: '3px solid var(--accent-primary)', borderRadius: '50%', 
            animation: 'spin 1s linear infinite', margin: '0 auto 20px' 
          }} />
          <h2 style={{ color: 'white', fontSize: '18px' }}>Syncing with Spotify...</h2>
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isArtist = user?.role === 'artist';
  const isVerifiedArtist = (isArtist && user?.status === 'verified') || isAdmin;

  const handleAddToPlaylist = async (songId, playlistId) => {
    try {
      await addSongToPlaylist(playlistId, songId);
      // No alert needed, handled in store
    } catch (err) {
      // No alert needed, handled in store
    }
  };

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      backgroundColor: 'var(--bg-deep)',
      color: 'var(--text-primary)',
      overflow: 'hidden'
    }}>
      <Toast />
      <AudioController />

      <Sidebar />
      
      <main style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        padding: 'var(--space-xl)',
        paddingBottom: '120px', 
        background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, transparent 40%)'
      }}>
        {/* Top Header */}
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-xl)',
          zIndex: 5
        }}>
          <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
             <button onClick={() => navigate(-1)} className="glass-effect" style={{ padding: '8px', borderRadius: '50%', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>&lt;</button>
             <button onClick={() => navigate(1)} className="glass-effect" style={{ padding: '8px', borderRadius: '50%', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>&gt;</button>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
             {isAdmin && (
               <button 
                 onClick={() => navigate('/admin')}
                 className="glass-effect" 
                 style={{ border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}
               >
                 Admin Panel
               </button>
             )}
             
             {isVerifiedArtist && (
               <button 
                 onClick={() => setIsUploadOpen(true)}
                 className="glass-effect" 
                 style={{ border: '1px solid var(--accent-secondary)', color: 'var(--accent-secondary)', padding: '6px 15px', borderRadius: '20px', cursor: 'pointer', fontWeight: '600' }}
               >
                 Upload Song
               </button>
             )}

             {!isAuthenticated ? (
               <>
                 <button onClick={() => setIsAuthOpen(true)} style={{ backgroundColor: 'transparent', color: 'var(--text-muted)', padding: '8px 20px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Sign up</button>
                 <button onClick={() => setIsAuthOpen(true)} style={{ backgroundColor: 'white', color: 'black', padding: '8px 30px', borderRadius: '25px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>Log in</button>
               </>
             ) : (
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                 <div style={{ textAlign: 'right' }}>
                   <div style={{ fontWeight: '600', fontSize: '14px' }}>{user?.name}</div>
                   <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role}</div>
                 </div>
                 <button onClick={() => logout()} className="glass-effect" style={{ padding: '6px 15px', borderRadius: '15px', border: 'none', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '12px' }}>Logout</button>
               </div>
             )}
          </div>
        </header>

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        <UploadSongModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />

        <Routes>
          <Route path="/admin" element={isAdmin ? <AdminDashboard onUploadClick={() => setIsUploadOpen(true)} /> : <div style={{ color: 'white', padding: '40px' }}>Access Denied</div>} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/history" element={<History />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />

          <Route path="*" element={
            <>
              <section style={{ marginBottom: 'var(--space-xl)' }}>
                <h2 style={{ fontSize: '28px', marginBottom: 'var(--space-lg)', color: 'white' }}>Good Evening</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
                  {loading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} height="64px" />)
                  ) : (
                    <>
                      <RecommendationCard title="Liked Songs" onClick={() => navigate('/favorites')} />
                      <RecommendationCard title="Made for You" />
                      <RecommendationCard title="Trending Now" />
                      <RecommendationCard title="Focus Mix" />
                    </>
                  )}
                </div>
              </section>

              {isAuthenticated && aiRecommendations.length > 0 && (
                <section style={{ marginBottom: 'var(--space-xl)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--space-lg)' }}>
                    <h2 style={{ fontSize: '24px', color: 'white' }}>AI Picked for You</h2>
                    <div className="glass-effect" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '12px', border: '1px solid var(--accent-secondary)' }}>
                       <Sparkles size={14} color="var(--accent-secondary)" />
                       <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-secondary)', textTransform: 'uppercase' }}>AI Enhanced</span>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-xl)' }}>
                    {aiRecommendations.map((song) => (
                      <SongCard 
                        key={`ai-${song._id}`} 
                        songId={song._id}
                        title={song.title} 
                        artist={song.artist} 
                        cover={song.coverImageUrl}
                        isLiked={likedSongs.includes(song._id)}
                        onLike={() => toggleFavorite(song._id)}
                        onClick={() => setCurrentSong(song)}
                        playlists={playlists}
                        onAddToPlaylist={(pid) => handleAddToPlaylist(song._id, pid)}
                        isAuthenticated={isAuthenticated}
                        isAI
                      />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 style={{ fontSize: '24px', marginBottom: 'var(--space-lg)', color: 'white' }}>Recently Played</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-xl)' }}>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => <Skeleton key={i} height="240px" />)
                  ) : history.length > 0 ? (
                    // Show top 6 from history on home screen
                    history.slice(0, 6).map((entry) => {
                      const song = entry.song;
                      if (!song) return null;
                      return (
                        <SongCard 
                          key={`${song._id}-${entry.playedAt}`} 
                          songId={song._id}
                          title={song.title} 
                          artist={song.artist} 
                          cover={song.coverImageUrl}
                          isLiked={likedSongs.includes(song._id)}
                          onLike={() => toggleFavorite(song._id)}
                          onClick={() => setCurrentSong(song)}
                          playlists={playlists}
                          onAddToPlaylist={(pid) => handleAddToPlaylist(song._id, pid)}
                          isAuthenticated={isAuthenticated}
                        />
                      );
                    })
                  ) : (
                    <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                      No recent history. Start listening!
                    </div>
                  )}
                </div>
              </section>

            </>
          } />
        </Routes>
      </main>

      <Player />
    </div>
  );
}

const RecommendationCard = ({ title, onClick }) => (
  <div onClick={onClick} className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)', height: '64px', padding: '0 var(--space-md)', cursor: 'pointer' }}>
    <div style={{ width: '48px', height: '48px', borderRadius: '4px', backgroundColor: 'var(--bg-elevated)', backgroundImage: 'linear-gradient(135deg, var(--accent-primary), var(--bg-deep))' }} />
    <span style={{ fontWeight: '600', fontSize: '14px', color: 'white' }}>{title}</span>
  </div>
);

const SongCard = ({ title, artist, cover, onClick, isLiked, onLike, songId, playlists, onAddToPlaylist, isAuthenticated, isAI }) => {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isBursting, setIsBursting] = useState(false);
  const API_URL = 'http://localhost:3000';

  const handleLike = (e) => {
    e.stopPropagation();
    setIsBursting(false);
    setTimeout(() => {
      setIsBursting(true);
      onLike();
    }, 10);
  };
  
  return (
    <div className="premium-card" style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)', padding: 'var(--space-md)', cursor: 'pointer' }} onClick={onClick}>
      <div style={{ position: 'relative' }}>
        <img 
          src={cover ? `${API_URL}/${cover}` : ''} 
          alt={title}
          style={{ aspectRatio: '1', width: '100%', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'var(--bg-elevated)', marginBottom: 'var(--space-xs)', backgroundImage: 'linear-gradient(135deg, #3f3f46, #18181b)' }} 
        />
        
        {isAI && (
          <div style={{ 
            position: 'absolute', top: '8px', left: '8px', 
            zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', 
            padding: '4px', borderRadius: '50%', border: '1px solid var(--accent-secondary)',
            backdropFilter: 'blur(4px)'
          }}>
            <Sparkles size={12} color="var(--accent-secondary)" />
          </div>
        )}

        {/* Like Button */}
        <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10 }}>
          <HeartBurst trigger={isBursting} />
          <button 
            onClick={handleLike}
            style={{
              padding: '8px',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.5)',
              border: 'none',
              color: isLiked ? '#ec4899' : 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            <Heart size={16} fill={isLiked ? '#ec4899' : 'none'} />
          </button>
        </div>

        {/* Add to Playlist Button */}
        {isAuthenticated && (
          <div style={{ position: 'absolute', bottom: '12px', right: '8px' }}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowPlaylists(!showPlaylists);
              }}
              style={{
                padding: '8px',
                borderRadius: '50%',
                backgroundColor: 'rgba(0,0,0,0.6)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
              }}
            >
              <Plus size={16} />
            </button>

            {/* Playlist Dropdown */}
            {showPlaylists && (
              <div 
                className="glass-effect" 
                style={{ 
                  position: 'absolute', bottom: '100%', right: 0, 
                  marginBottom: '10px', width: '160px', 
                  borderRadius: '12px', padding: '8px', zIndex: 100,
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '8px' }}>Add to playlist</div>
                {playlists.length > 0 ? (
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {playlists.map(p => (
                      <div 
                        key={p._id} 
                        onClick={() => { onAddToPlaylist(p._id); setShowPlaylists(false); }}
                        style={{ padding: '6px 8px', borderRadius: '4px', fontSize: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}
                        className="hover-effect"
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <ListMusic size={12} /> {p.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '10px 0' }}>No playlists yet</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <h3 style={{ fontSize: '15px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{artist}</p>
    </div>
  );
};

const Skeleton = ({ height }) => (
  <div className="glass-effect" style={{ 
    height, 
    width: '100%', 
    borderRadius: '12px', 
    animation: 'pulse 2s infinite ease-in-out',
    opacity: 0.3
  }} />
);

export default App;

