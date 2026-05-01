import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { X, Mail, Lock, User } from 'lucide-react';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  
  const { login, signup, loading, error } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(email, password);
    } else {
      await signup(email, password, name, role);
    }
    // Only close if successful
    if (!error && !loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '20px'
      }} onClick={onClose}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="glass-effect"
          style={{
            width: '100%',
            maxWidth: '420px',
            borderRadius: '24px',
            padding: '40px',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            <X size={24} />
          </button>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }} className="gradient-text">
              {isLogin ? 'Welcome Back' : 'Join Spotifiy'}
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              {isLogin ? 'Listen to millions of songs for free' : 'Start your journey with us today'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isLogin && (
              <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                <button 
                  type="button"
                  onClick={() => setRole('client')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid ' + (role === 'client' ? 'var(--accent-primary)' : 'var(--glass-border)'),
                    backgroundColor: role === 'client' ? 'var(--accent-soft)' : 'transparent',
                    color: role === 'client' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Listener
                </button>
                <button 
                  type="button"
                  onClick={() => setRole('artist')}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1px solid ' + (role === 'artist' ? 'var(--accent-primary)' : 'var(--glass-border)'),
                    backgroundColor: role === 'artist' ? 'var(--accent-soft)' : 'transparent',
                    color: role === 'artist' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  Artist
                </button>
              </div>
            )}

            {!isLogin && (
              <InputGroup 
                icon={<User size={20} />} 
                placeholder="Full Name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}
            
            <InputGroup 
              icon={<Mail size={20} />} 
              type="email" 
              placeholder="Email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <InputGroup 
              icon={<Lock size={20} />} 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <p style={{ color: '#ef4444', fontSize: '14px', textAlign: 'center' }}>{error}</p>
            )}

            <button 
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                color: 'white',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                marginTop: '10px',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
              }}
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Signup')}
            </button>
          </form>

          <div style={{ margin: '24px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-bright)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-bright)' }} />
          </div>

          <button style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '12px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--glass-border)',
            color: 'white',
            cursor: 'pointer',
            fontWeight: '500'
          }}>
            Continue with Google
          </button>

          <p style={{ textAlign: 'center', marginTop: '32px', color: 'var(--text-secondary)', fontSize: '14px' }}>
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <span 
              onClick={() => setIsLogin(!isLogin)}
              style={{ color: 'var(--accent-primary)', fontWeight: '600', cursor: 'pointer' }}
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </span>
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const InputGroup = ({ icon, ...props }) => (
  <div style={{ position: 'relative' }}>
    <div style={{
      position: 'absolute',
      left: '16px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: 'var(--text-muted)'
    }}>
      {icon}
    </div>
    <input 
      {...props}
      style={{
        width: '100%',
        padding: '14px 16px 14px 48px',
        borderRadius: '12px',
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid var(--glass-border)',
        color: 'white',
        outline: 'none',
        fontSize: '15px',
        transition: 'var(--transition-smooth)'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--accent-primary)';
        e.target.style.backgroundColor = 'rgba(255,255,255,0.08)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--glass-border)';
        e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
      }}
    />
  </div>
);

export default AuthModal;
