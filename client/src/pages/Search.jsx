import React, { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { useMusicStore } from '../store/useMusicStore';
import { useAuthStore } from '../store/useAuthStore';
import { Search as SearchIcon, ListMusic, Plus, Heart } from 'lucide-react';
import HeartBurst from '../components/HeartBurst';

const API_URL = 'http://192.168.1.14:3000';

const Search = () => {
  const { songs, setCurrentSong, likedSongs, toggleFavorite, playlists, addSongToPlaylist } = useMusicStore();
  const { isAuthenticated } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const fuse = useMemo(() => new Fuse(songs, {
    keys: ['title', 'artist', 'genre'],
    threshold: 0.4, // lower is more strict, 0.4 allows some typos
    ignoreLocation: true,
  }), [songs]);

  const filteredSongs = useMemo(() => {
    if (!searchQuery) return [];
    return fuse.search(searchQuery).map(result => result.item);
  }, [searchQuery, fuse]);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div style={{ 
        position: 'sticky', 
        top: '0', 
        zIndex: 10, 
        paddingTop: '20px', 
        paddingBottom: '20px', 
        backgroundColor: 'var(--bg-deep)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: 'white', 
          borderRadius: '30px', 
          padding: '12px 24px',
          width: '100%',
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
        }}>
          <SearchIcon size={24} color="#000" style={{ marginRight: '12px' }} />
          <input 
            type="text" 
            placeholder="What do you want to listen to?" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              border: 'none', 
              outline: 'none', 
              width: '100%', 
              fontSize: '16px',
              color: '#000',
              fontWeight: '500'
            }}
            autoFocus
          />
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        {searchQuery ? (
          <div>
            <h2 style={{ fontSize: '24px', color: 'white', marginBottom: '20px' }}>
              Search Results for "{searchQuery}"
            </h2>
            {filteredSongs.length > 0 ? (
               <div className="song-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 'var(--space-xl)' }}>
                 {filteredSongs.map(song => (
                   <SongCard 
                     key={`search-${song._id}`} 
                     song={song}
                     isAuthenticated={isAuthenticated}
                     isLiked={likedSongs.includes(song._id)}
                     onLike={() => toggleFavorite(song._id)}
                     onClick={() => setCurrentSong(song)}
                     playlists={playlists}
                     onAddToPlaylist={(pid) => addSongToPlaylist(pid, song._id)}
                   />
                 ))}
               </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
                <SearchIcon size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
                <h3>No results found for "{searchQuery}"</h3>
                <p>Please make sure your words are spelled correctly or use less or different keywords.</p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '60px' }}>
             <h3>Browse all your favorite music</h3>
             <p>Start typing to search for songs, artists, or genres.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const SongCard = ({ song, onClick, isLiked, onLike, playlists, onAddToPlaylist, isAuthenticated }) => {
  const [showPlaylists, setShowPlaylists] = useState(false);
  const [isBursting, setIsBursting] = useState(false);

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
          src={song.coverImageUrl ? (song.coverImageUrl.startsWith('http') ? song.coverImageUrl : `${API_URL}/${song.coverImageUrl}`) : '/default-cover.png'} 
          onError={(e) => { e.target.src = '/default-cover.png'; e.target.onerror = null; }}
          alt={song.title}
          style={{ aspectRatio: '1', width: '100%', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'var(--bg-elevated)', marginBottom: 'var(--space-xs)', backgroundImage: 'linear-gradient(135deg, #3f3f46, #18181b)' }} 
        />
        
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
      <h3 style={{ fontSize: '15px', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{song.title}</h3>
      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{song.artist}</p>
    </div>
  );
};

export default Search;
