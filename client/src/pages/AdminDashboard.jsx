import React, { useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { CheckCircle, XCircle, User, Award, ShieldAlert } from 'lucide-react';

const AdminDashboard = ({ onUploadClick }) => {
  const { artists, fetchArtists, verifyArtist, blockUser } = useAuthStore();

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

  return (
    <div style={{ padding: 'var(--space-md)' }}>
      <header style={{ marginBottom: 'var(--space-xl)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '32px', color: 'white', marginBottom: '8px' }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage user accounts and verify artists across the platform.</p>
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
        <StatCard icon={<Award color="var(--accent-secondary)" />} label="Verified" count={artists.filter(a => a.status === 'verified').length} />
        <StatCard icon={<ShieldAlert color="#ef4444" />} label="Pending Actions" count={artists.filter(a => a.status === 'pending').length} />
      </div>

      <div className="glass-effect" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-bright)' }}>
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
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '12px' }}>
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
        {artists.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
            No artists found in the system.
          </div>
        )}
      </div>
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
