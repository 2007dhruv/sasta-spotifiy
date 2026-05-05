import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useMusicStore } from '../store/useMusicStore';
import { CheckCircle, XCircle, User, Award, ShieldAlert, Music, Edit2, Trash2 } from 'lucide-react';
import EditSongModal from '../components/EditSongModal';

const API_URL = 'http://192.168.1.14:3000';

const AdminDashboard = ({ onUploadClick }) => {
  const { artists, fetchArtists, verifyArtist, blockUser } = useAuthStore();
  const { songs, fetchSongs, deleteSong } = useMusicStore();
  const [activeTab, setActiveTab] = useState('artists');
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [songToEdit, setSongToEdit] = useState(null);

  useEffect(() => {
    fetchArtists();
    fetchSongs();
  }, [fetchArtists, fetchSongs]);

  const handleEditClick = (song) => {
    setSongToEdit(song);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (songId) => {
    if (window.confirm('Are you sure you want to delete this song?')) {
      await deleteSong(songId);
    }
  };

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage user accounts, verify artists, and manage songs across the platform.</p>
        </div>
        <button 
          onClick={onUploadClick}
          className="glass-effect"
          style={{ 
            backgroundColor: 'var(--accent-secondary)', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            border: 'none', 
            fontWeight: '600', 
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(34, 197, 94, 0.4)'
          }}
        >
          Add New Song
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)' }}>
        <StatCard icon={<User color="var(--accent-primary)" />} label="Total Artists" count={artists.length} />
        <StatCard icon={<Music color="#3b82f6" />} label="Total Songs" count={songs.length} />
        <StatCard icon={<ShieldAlert color="#ef4444" />} label="Pending Artists" count={artists.filter(a => a.status === 'pending').length} />
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('artists')}
          style={{
            padding: '10px 24px',
            borderRadius: '24px',
            border: 'none',
            background: activeTab === 'artists' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'artists' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Manage Artists
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          style={{
            padding: '10px 24px',
            borderRadius: '24px',
            border: 'none',
            background: activeTab === 'songs' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            color: activeTab === 'songs' ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          Manage Songs
        </button>
      </div>

      <div className="glass-effect" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-bright)' }}>
        {activeTab === 'artists' ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Name</th>
                <th style={{ padding: '16px 24px' }}>Email</th>
                <th style={{ padding: '16px 24px' }}>Status</th>
                <th style={{ padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map((artist) => (
                <tr key={artist._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
                        {artist.name[0]}
                      </div>
                      <span style={{ fontWeight: '500', color: 'white' }}>{artist.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{artist.email}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '12px', 
                      fontWeight: '600',
                      backgroundColor: artist.status === 'verified' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: artist.status === 'verified' ? 'var(--accent-secondary)' : '#f59e0b'
                    }}>
                      {artist.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {artist.status !== 'verified' && (
                        <ActionBtn onClick={() => verifyArtist(artist._id)} icon={<CheckCircle size={18} />} color="var(--accent-secondary)" tooltip="Verify" />
                      )}
                      <ActionBtn onClick={() => blockUser(artist._id)} icon={<XCircle size={18} />} color="#ef4444" tooltip="Block" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '13px', textTransform: 'uppercase' }}>
                <th style={{ padding: '16px 24px' }}>Title</th>
                <th style={{ padding: '16px 24px' }}>Artist</th>
                <th style={{ padding: '16px 24px' }}>Genre</th>
                <th style={{ padding: '16px 24px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {songs.map((song) => (
                <tr key={song._id} style={{ borderBottom: '1px solid var(--border-subtle)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={song.coverImageUrl ? (song.coverImageUrl.startsWith('http') ? song.coverImageUrl : `${API_URL}/${song.coverImageUrl}`) : '/default-cover.png'} 
                        onError={(e) => { e.target.src = '/default-cover.png'; e.target.onerror = null; }}
                        alt={song.title}
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <span style={{ fontWeight: '500', color: 'white' }}>{song.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{song.artist}</td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>{song.genre}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <ActionBtn onClick={() => handleEditClick(song)} icon={<Edit2 size={18} />} color="#3b82f6" tooltip="Edit Song" />
                      <ActionBtn onClick={() => handleDeleteClick(song._id)} icon={<Trash2 size={18} />} color="#ef4444" tooltip="Delete Song" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'artists' && artists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No artists found in the system.
          </div>
        )}
        {activeTab === 'songs' && songs.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No songs found in the system.
          </div>
        )}
      </div>

      <EditSongModal 
        isOpen={isEditModalOpen} 
        onClose={() => {
          setIsEditModalOpen(false);
          setSongToEdit(null);
        }} 
        songToEdit={songToEdit} 
      />
    </div>
  );
};

const StatCard = ({ icon, label, count }) => (
  <div className="premium-card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.03)' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: '700', color: 'white' }}>{count}</div>
    </div>
  </div>
);

const ActionBtn = ({ onClick, icon, color, tooltip }) => (
  <button 
    onClick={onClick}
    title={tooltip}
    style={{ 
      background: 'none', 
      border: 'none', 
      color: color, 
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '6px',
      transition: 'background 0.2s'
    }}
    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255,255,255,0.05)'}
    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
  >
    {icon}
  </button>
);

export default AdminDashboard;
