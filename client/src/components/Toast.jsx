import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { useMusicStore } from '../store/useMusicStore';

const Toast = () => {
  const { toast } = useMusicStore();

  return (
    <AnimatePresence>
      {toast.show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          style={{
            position: 'fixed',
            bottom: '100px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            backgroundColor: toast.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            color: 'white',
            boxShadow: `0 20px 40px rgba(0,0,0,0.5), inset 0 0 20px ${toast.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}`,
            minWidth: '280px',
            justifyContent: 'center'
          }}
        >
          {toast.type === 'success' ? (
            <CheckCircle size={18} color="#34d399" />
          ) : (
            <AlertCircle size={18} color="#f87171" />
          )}
          <span style={{ fontWeight: '500', fontSize: '13px', letterSpacing: '0.01em' }}>{toast.message}</span>
        </motion.div>

      )}
    </AnimatePresence>
  );
};

export default Toast;
