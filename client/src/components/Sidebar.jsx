import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, Library, PlusSquare, Heart, Download, ListMusic, Clock, Trash2 } from 'lucide-react';
import { useMusicStore } from '../store/useMusicStore';
import { useAuthStore } from '../store/useAuthStore';
import CreatePlaylistModal from './CreatePlaylistModal';
import ConfirmModal from './ConfirmModal';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { playlists, fetchPlaylists, createPlaylist, deletePlaylist, showToast } = useMusicStore();
  const { isAuthenticated } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [playlistToDelete, setPlaylistToDelete] = React.useState(null);
  const [hoveredPlaylistId, setHoveredPlaylistId] = React.useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchPlaylists();
    }
  }, [isAuthenticated, fetchPlaylists]);

  const handleCreatePlaylist = async (name) => {
    try {
      const newPlaylist = await createPlaylist(name);
      showToast(`Created playlist "${name}"!`);
      navigate(`/playlist/${newPlaylist._id}`);
    } catch (err) {
      showToast('Failed to create playlist', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!playlistToDelete) return;
    try {
      await deletePlaylist(playlistToDelete._id);
      if (location.pathname === `/playlist/${playlistToDelete._id}`) {
        navigate('/');
      }
      setPlaylistToDelete(null);
    } catch (err) {
      // Handled by store
    }
  };


  return (
    <div className="glass-effect sidebar-container" style={{
      width: '240px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: 'var(--space-md)',
      gap: 'var(--space-lg)',
      borderRight: '1px solid var(--border-subtle)',
      zIndex: 10
    }}>
      <div style={{ padding: '0 var(--space-sm)', marginBottom: 'var(--space-md)' }}>
        <h2 className="gradient-text" style={{ fontSize: '24px', letterSpacing: '-1px', cursor: 'pointer' }} onClick={() => navigate('/')}>Spotifiy</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
        <SidebarLink 
          icon={<Home size={22} />} 
          label="Home" 
          active={location.pathname === '/'} 
          onClick={() => navigate('/')} 
        />
        <SidebarLink 
          icon={<Search size={22} />} 
          label="Search" 
          active={location.pathname === '/search'} 
          onClick={() => navigate('/search')} 
        />
        <SidebarLink 
          icon={<Clock size={22} />} 
          label="History" 
          active={location.pathname === '/history'} 
          onClick={() => navigate('/history')} 
        />
        <SidebarLink icon={<Library size={22} />} label="Your Library" />

      </nav>

      <div style={{ marginTop: 'var(--space-xl)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', flex: 1, overflow: 'hidden' }}>
        <SidebarLink 
          icon={<PlusSquare size={22} />} 
          label="Create Playlist" 
          onClick={() => setIsModalOpen(true)}
        />
        
        <CreatePlaylistModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          onCreate={handleCreatePlaylist} 
        />
        <SidebarLink 
          icon={<Heart size={22} />} 
          label="Liked Songs" 
          active={location.pathname === '/favorites'}
          onClick={() => navigate('/favorites')} 
        />

        <div style={{ 
          marginTop: 'var(--space-md)', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 'var(--space-xs)',
          paddingRight: '4px'
        }}>
          {playlists.map((playlist) => (
            <div 
              key={playlist._id}
              onClick={() => navigate(`/playlist/${playlist._id}`)}
              onMouseEnter={() => {
                setHoveredPlaylistId(playlist._id);
              }}
              onMouseLeave={() => {
                setHoveredPlaylistId(null);
              }}
              style={{
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '14px',
                color: location.pathname === `/playlist/${playlist._id}` ? 'white' : 'var(--text-secondary)',
                backgroundColor: location.pathname === `/playlist/${playlist._id}` ? 'rgba(255,255,255,0.1)' : 'transparent',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                transition: '0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <ListMusic size={16} style={{ flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{playlist.name}</span>
              </div>
              
              {hoveredPlaylistId === playlist._id && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setPlaylistToDelete(playlist);
                  }}
                  style={{
                    padding: '4px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                  onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <ConfirmModal 
        isOpen={!!playlistToDelete}
        onClose={() => setPlaylistToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Playlist"
        message={`Are you sure you want to delete "${playlistToDelete?.name}"?`}
        confirmText="Delete"
      />

      <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)' }}>
        <SidebarLink icon={<Download size={20} />} label="Install App" />
      </div>
    </div>
  );
};

const SidebarLink = ({ icon, label, active, onClick }) => (
  <div onClick={onClick} style={{
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-md)',
    color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
    cursor: 'pointer',
    padding: 'var(--space-sm) var(--space-md)',
    borderRadius: '8px',
    transition: 'var(--transition-smooth)',
    backgroundColor: active ? 'rgba(255,255,255,0.1)' : 'transparent',
  }}
  onMouseEnter={(e) => {
    if (!active) {
      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
      e.currentTarget.style.color = 'var(--text-primary)';
    }
  }}
  onMouseLeave={(e) => {
    if (!active) {
      e.currentTarget.style.backgroundColor = 'transparent';
      e.currentTarget.style.color = 'var(--text-secondary)';
    }
  }}
  >
    {icon}
    <span style={{ fontWeight: active ? '600' : '400', fontSize: '15px' }}>{label}</span>
  </div>
);

export default Sidebar;

